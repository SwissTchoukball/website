<template>
  <nuxt-link
    :to="localePath({ name: 'events', query: { month: startMonth, year: startYear }, hash: `#event-${event.id}` })"
    class="c-event"
  >
    <div v-if="isWithinSingleMonth" class="c-event__date">
      <span class="c-event__date-days" :class="{ 'c-event__date-days--range': !isSingleDay }">{{ days }}</span>
      <span class="c-event__date-months">{{ months }}</span>
    </div>
    <div v-else class="c-event__date c-event__date--range">
      <span class="c-event__date-day-month">
        {{ startDay }}.<span class="c-event__day-month-short">{{ startMonth }}</span>
      </span>
      <span class="c-event__date-separator"></span>
      <span class="c-event__date-day-month">
        {{ endDay }}.<span class="c-event__day-month-short">{{ endMonth }}</span>
      </span>
    </div>
    <div class="c-event__main">
      <h3 class="c-event__name">{{ event.name }}</h3>
      <div class="c-event__details">
        <time class="c-event__time">{{ startTime }}</time>
        <span v-if="event.venue" class="c-event__venue">{{ event.venue.name }}</span>
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { isSameDay, isSameMonth } from 'date-fns';
import { CalendarEvent } from '~/plugins/cms-service';

export default Vue.extend({
  props: {
    event: {
      type: Object as PropType<CalendarEvent>,
      required: true,
    },
  },
  computed: {
    isSingleDay(): boolean {
      return isSameDay(this.event.date_start, this.event.date_end);
    },
    isWithinSingleMonth(): boolean {
      return isSameMonth(this.event.date_start, this.event.date_end);
    },
    days(): string {
      let days = this.$formatDate(this.event.date_start, 'd');
      if (!this.isSingleDay) {
        days += `-${this.$formatDate(this.event.date_end, 'd')}`;
      }

      return days;
    },
    months(): string {
      let months = this.$formatDate(this.event.date_start, 'MMMM');
      if (!this.isWithinSingleMonth) {
        months = `${this.$formatDate(this.event.date_start, 'MMM')} -  ${this.$formatDate(this.event.date_end, 'MMM')}`;
        months = months.replace(/\./g, '');
      }

      return months;
    },
    startDay(): string {
      return this.$formatDate(this.event.date_start, 'd');
    },
    endDay(): string {
      return this.$formatDate(this.event.date_end, 'd');
    },
    startMonth(): string {
      return this.$formatDate(this.event.date_start, 'M');
    },
    endMonth(): string {
      return this.$formatDate(this.event.date_end, 'M');
    },
    startYear(): string {
      return this.$formatDate(this.event.date_start, 'yyyy');
    },
    startTime(): string | null {
      return !this.event.isFullDay ? this.$formatDate(this.event.date_start, 'HH:mm') : null;
    },
  },
});
</script>

<style scoped>
.c-event {
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.c-event__date {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
  margin-right: var(--st-length-spacing-xs);
  width: 3rem;
}

/* .c-event__date--range {
  display: block;
  white-space: normal;
  text-align: center;
} */

.c-event__date-separator {
  height: 2px;
  width: 0.5rem;
  background-color: black;
  margin: 0.2rem 0;
}

.c-event__date-days {
  font-size: 1.7em;
}

.c-event__date-days--range {
  font-size: 1.2em;
}

.c-event__date-months,
.c-event__day-month-short {
  color: var(--st-color-event-month);
}

.c-event__main {
  min-width: 0;
}

.c-event__name {
  font-size: 1em;
}

/* .c-event__details {
  font-size: 0.8em;
} */

.c-event__name,
.c-event__details {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
