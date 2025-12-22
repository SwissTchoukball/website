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
      <div v-if="context" class="c-event__context">
        {{ context }}
      </div>
      <h3 class="c-event__name" :title="name">{{ name }}</h3>
      <div class="c-event__details">
        <time class="c-event__time">{{ startTime }}</time> {{ details }}
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { isSameDay, isSameMonth } from 'date-fns';

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
  name: {
    type: String,
    required: true,
  },
  context: {
    type: String,
    default: undefined,
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
});

const isSingleDay = computed<boolean>(() => {
  return !props.endDate || isSameDay(props.startDate, props.endDate);
});

const isWithinSingleMonth = computed<boolean>(() => {
  return !props.endDate || isSameMonth(props.startDate, props.endDate);
});

const days = computed<string>(() => {
  let days = $formatDate(props.startDate, 'd');
  if (!isSingleDay.value) {
    days += `-${$formatDate(props.endDate, 'd')}`;
  }

  return days;
});

const months = computed<string>(() => {
  let months = $formatDate(props.startDate, 'MMM');
  if (!isWithinSingleMonth.value) {
    months = `${$formatDate(props.startDate, 'MMM')} -  ${$formatDate(props.endDate, 'MMM')}`;
    months = months.replace(/\./g, '');
  }

  return months;
});

const startDay = computed<string>(() => {
  return $formatDate(props.startDate, 'd');
});

const endDay = computed<string>(() => {
  return $formatDate(props.endDate, 'd');
});

const startMonth = computed<string>(() => {
  return $formatDate(props.startDate, 'M');
});

const endMonth = computed<string>(() => {
  return $formatDate(props.endDate, 'M');
});

const startTime = computed<string | null>(() => {
  return !props.isFullDay ? $formatDate(props.startDate, 'HH:mm') : null;
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

.c-event__context {
  font-size: 0.6em;
  text-transform: uppercase;
  font-weight: bold;
  color: var(--st-color-event-context);
}

.c-event__name,
.c-event__details {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
