<template>
  <nuxt-link :to="to" class="c-event">
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
      <h3 class="c-event__name" :title="name">{{ name }}</h3>
      <div class="c-event__details">
        <time class="c-event__time">{{ startTime }}</time> {{ details }}
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { isSameDay, isSameMonth } from 'date-fns';

export default Vue.extend({
  props: {
    startDate: {
      type: Date as PropType<Date>,
      required: true,
    },
    endDate: {
      type: Date as PropType<Date>,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      required: true,
    },
    isFullDay: Boolean,
  },
  computed: {
    isSingleDay(): boolean {
      return !this.endDate || isSameDay(this.startDate, this.endDate);
    },
    isWithinSingleMonth(): boolean {
      return !this.endDate || isSameMonth(this.startDate, this.endDate);
    },
    days(): string {
      let days = this.$formatDate(this.startDate, 'd');
      if (!this.isSingleDay) {
        days += `-${this.$formatDate(this.endDate, 'd')}`;
      }

      return days;
    },
    months(): string {
      let months = this.$formatDate(this.startDate, 'MMM');
      if (!this.isWithinSingleMonth) {
        months = `${this.$formatDate(this.startDate, 'MMM')} -  ${this.$formatDate(this.endDate, 'MMM')}`;
        months = months.replace(/\./g, '');
      }

      return months;
    },
    startDay(): string {
      return this.$formatDate(this.startDate, 'd');
    },
    endDay(): string {
      return this.$formatDate(this.endDate, 'd');
    },
    startMonth(): string {
      return this.$formatDate(this.startDate, 'M');
    },
    endMonth(): string {
      return this.$formatDate(this.endDate, 'M');
    },
    startYear(): string {
      return this.$formatDate(this.startDate, 'yyyy');
    },
    startTime(): string | null {
      return !this.isFullDay ? this.$formatDate(this.startDate, 'HH:mm') : null;
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
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
  margin-right: var(--st-length-spacing-xs);
  width: 3.8rem;
}

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

.c-event__name,
.c-event__details {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
