<template>
  <time
    :datetime="startDate.toISOString()"
    class="c-event-date"
    :class="{ 'c-event-date--one-line': alwaysOneLine, 'c-event-date--cancelled': cancelled }"
  >
    <span class="c-event-date__week-days">{{ weekDays }}</span>
    <span class="c-event-date__days">{{ days }}</span>
    <span class="c-event-date__months">{{ months }}</span>
    <span v-if="showYear" class="c-event-date__year">{{ year }}</span>
  </time>
</template>

<script setup lang="ts">
import { isSameDay, isSameMonth, isSameYear } from 'date-fns';

const { $formatDate } = useNuxtApp();

const props = defineProps({
  startDate: {
    type: Date as PropType<Date>,
    required: true,
  },
  endDate: {
    type: Date as PropType<Date>,
    default: null,
  },
  showYear: Boolean,
  /**
   * Renders the date on a single line regardless of the viewport,
   * as opposed to the default behaviour which wraps the date on three lines
   * starting from viewport small and up.
   */
  alwaysOneLine: Boolean,
  cancelled: Boolean,
});

const isSingleDay = computed<boolean>(() => {
  return !props.endDate || isSameDay(props.startDate, props.endDate);
});

const isWithinSingleMonth = computed<boolean>(() => {
  return !props.endDate || isSameMonth(props.startDate, props.endDate);
});

const isWithinSingleYear = computed<boolean>(() => {
  return !props.endDate || isSameYear(props.startDate, props.endDate);
});

const weekDays = computed<string>(() => {
  let weekDays = $formatDate(props.startDate, 'EEEE');
  if (!isSingleDay.value) {
    weekDays = `${$formatDate(props.startDate, 'EEE')} - ${$formatDate(props.endDate, 'EEE')}`;
    weekDays = weekDays.replace(/\./g, '');
  }

  return weekDays;
});

const days = computed<string>(() => {
  let days = $formatDate(props.startDate, 'd');
  if (!isSingleDay.value) {
    days += ` - ${$formatDate(props.endDate, 'd')}`;
  }

  return days;
});

const months = computed<string>(() => {
  let months = $formatDate(props.startDate, 'MMMM');
  if (!isWithinSingleMonth.value) {
    months = `${$formatDate(props.startDate, 'MMM')} - ${$formatDate(props.endDate, 'MMM')}`;
    months = months.replace(/\./g, '');
  }

  return months;
});

const year = computed<string>(() => {
  let year = $formatDate(props.startDate, 'yyyy');
  if (!isWithinSingleYear.value) {
    year += ` - ${$formatDate(props.endDate, 'yyyy')}`;
  }

  return year;
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-event-date {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.c-event-date > * {
  margin-right: var(--st-length-spacing-xxs);
}

.c-event-date__week-days {
  color: var(--st-color-event-day-of-week);
}

.c-event-date__months {
  color: var(--st-color-event-month);
}

.c-event-date--cancelled .c-event-date__week-days,
.c-event-date--cancelled .c-event-date__days,
.c-event-date--cancelled .c-event-date__months {
  color: var(--st-color-event-foreground-cancelled);
}

@media (--sm-and-up) {
  .c-event-date:not(.c-event-date--one-line) {
    flex-shrink: 0;
    flex-direction: column;
    margin-right: var(--st-length-spacing-s);
    width: 7rem;
  }

  .c-event-date:not(.c-event-date--one-line) > * {
    margin-right: 0;
  }

  .c-event-date:not(.c-event-date--one-line) .c-event-date__days {
    font-size: 2em;
  }
}
</style>
