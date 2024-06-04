<template>
  <div class="c-month-calendar" :style="`grid-template-rows: 1rem repeat(${weeksInMonth}, 1fr)`">
    <div v-for="dayOfWeek in weekDaysInWords" :key="dayOfWeek" class="c-month-calendar__day-of-week-title">
      {{ dayOfWeek }}
    </div>
    <div
      v-for="(day, key) in days"
      :key="key"
      class="c-month-calendar__day"
      :class="{
        'c-month-calendar__day--today': isToday(day.date),
        'c-month-calendar__day--other-month': isInOtherMonth(day.date),
      }"
      :style="{ 'min-height': `calc(1.6rem + ${1.1 * day.events.length}rem)` }"
    >
      <div class="c-month-calendar__date">{{ day.date.getDate() }}</div>
      <template v-for="event in day.events">
        <nuxt-link
          v-if="event.numberDaysVisible"
          :key="event.id"
          v-tooltip.bottom="event.name"
          :to="localePath({ name: 'event-slug', params: { slug: `${event.id}-${slugify(event.name)}` } })"
          class="c-month-calendar__event"
          :class="{ 'c-month-calendar__event--full-or-multi-day': isFullOrMultiDay(event) }"
          :style="{
            width: `calc(${event.numberDaysVisible * 100}% + ${event.numberDaysVisible - 1}px - 0.2rem)`,
            top: `calc(1.6rem + ${1.1 * event.position}rem)`,
          }"
        >
          <span
            v-if="!isFullOrMultiDay(event) && event.time_start"
            class="c-month-calendar__event-single-day-start-time"
          >
            {{ event.time_start.substr(0, 5) }}
          </span>
          <span>{{ event.name }}</span>
        </nuxt-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  getWeeksInMonth,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isToday,
  lastDayOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarEvent } from '~/plugins/08.cms-service';

interface CalendarDay {
  date: Date;
  events: (CalendarEvent & { numberDaysVisible: number; position: number })[];
}

interface CalendarDays {
  [key: string]: CalendarDay;
}

const localePath = useLocalePath();
const { $formatDate } = useNuxtApp();
const { slugify } = useSlugify();

const props = defineProps({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  events: {
    type: Array as PropType<CalendarEvent[]>,
    default: () => [],
  },
});

const weekDaysInWords = ref(
  ((): string[] => {
    const now = new Date();
    const arr = eachDayOfInterval({
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    });
    return arr.reduce((a, d) => {
      a.push($formatDate(d, 'EEEE'));
      return a;
    }, [] as string[]);
  })(),
);

const startOfGivenMonth = computed<Date>(() => {
  return startOfMonth(new Date(props.year, props.month - 1));
});

const firstDay = computed<Date>(() => {
  return startOfWeek(startOfGivenMonth.value, { weekStartsOn: 1 });
});

const weeksInMonth = computed<number>(() => {
  return getWeeksInMonth(startOfGivenMonth.value, { weekStartsOn: 1 });
});

const days = computed<CalendarDays>(() => {
  const days: CalendarDays = {};
  let date = firstDay.value;
  const numberDaysInCalendar = weeksInMonth.value * 7;
  // Defining the days that we show in the calendar for the given month
  for (let d = 0; d < numberDaysInCalendar; d++) {
    days[format(date, 'yyyy-MM-dd')] = {
      date,
      events: [],
    };
    date = addDays(date, 1);
  }

  // Adding the events to the calendar
  props.events.forEach((event) => {
    let eventDate = event.date_start;
    let day: CalendarDay | undefined;
    let position = 0;

    // We add an event to each day of the calendar, but we only make it visible on the first day of the event in a week.
    // And we make the event block expand until the last day, or the end of the week.
    // We still add the event to the other days just to know that it is there to help with positioning the other events.
    do {
      day = days[format(eventDate, 'yyyy-MM-dd')];
      let numberDaysVisible = 0;
      const isStartOfWeek = isSameDay(eventDate, startOfWeek(eventDate, { weekStartsOn: 1 }));

      // When starting a new week, we reset the position as we don't need the continuity with the previous week
      if (isStartOfWeek) {
        position = 0;
      }

      if (eventDate === event.date_start || isStartOfWeek) {
        // First day of the event, or continuation of it on a new week
        if (isSameWeek(eventDate, event.date_end, { weekStartsOn: 1 })) {
          // Ends this week
          numberDaysVisible = differenceInCalendarDays(event.date_end, eventDate) + 1;
        } else {
          // Ends later than this week
          numberDaysVisible = differenceInCalendarDays(lastDayOfWeek(eventDate, { weekStartsOn: 1 }), eventDate) + 1;
        }
      }

      // If `numberDaysVisible` is set (other than 0), it means that the event will be rendered.
      // We have to seek for an available position
      if (numberDaysVisible) {
        let positionSeeking = 0;
        let firstAvailablePosition: number | undefined;
        do {
          if (!day?.events.some((event) => event.position === positionSeeking)) {
            firstAvailablePosition = positionSeeking;
          } else {
            positionSeeking++;
          }
        } while (typeof firstAvailablePosition === 'undefined');

        if (firstAvailablePosition) {
          // We add this condition to make TypeScript happy, even though it is certain at this point that `firstAvailablePosition` is defined.
          position = firstAvailablePosition;
        }
      }

      day?.events.push({
        ...event,
        numberDaysVisible,
        position,
      });
      eventDate = addDays(eventDate, 1);
    } while (eventDate <= event.date_end);
  });
  return days;
});

const isInOtherMonth = (date: Date) => {
  return !isSameMonth(date, startOfGivenMonth.value);
};
const isFullOrMultiDay = (event: CalendarEvent) => {
  return event.isFullDay || !isSameDay(event.date_start, event.date_end);
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-month-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: var(--st-length-spacing-s);
}

.c-month-calendar__day-of-week-title {
  border-bottom: 1px solid var(--st-color-calendar-border);
  border-right-width: 0;
  font-size: 0.6rem;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}

.c-month-calendar__day {
  position: relative;
  box-sizing: border-box;
  border: 1px solid var(--st-color-calendar-border);
  border-top-width: 0;
  border-right-width: 0;
}

.c-month-calendar__day:nth-child(-n + 7) {
  border-top-width: 1px;
}

.c-month-calendar__day:nth-child(7n) {
  border-right-width: 1px;
}

.c-month-calendar__day--other-month {
  color: var(--st-color-calendar-day-not-in-month-color);
}

.c-month-calendar__date {
  font-size: 0.8em;
  font-weight: 500;
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  border-radius: 50%;
  height: 1.4rem;
  width: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-month-calendar__day--today .c-month-calendar__date {
  color: var(--st-color-calendar-today-foreground);
  background-color: var(--st-color-calendar-today-background);
}

.c-month-calendar__event {
  display: block;
  position: absolute;
  left: 0.1rem;
  font-size: 0.7em;
  font-weight: 500;
  color: inherit;
  padding: 0.1em;
  border-radius: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  z-index: 1;
}

.c-month-calendar__event--full-or-multi-day {
  background-color: var(--st-color-calendar-event-background);
}

.c-month-calendar__event-single-day-start-time {
  display: none;
  color: var(--st-color-calendar-event-time);
}

@media (--sm-and-up) {
  .c-month-calendar__event-single-day-start-time {
    display: inline;
  }
}
</style>
