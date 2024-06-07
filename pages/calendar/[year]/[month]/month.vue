<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ $t('events.title') }} - {{ monthName }}</h2>

    <st-calendar-nav class="c-calendar-month__calendar-navigation" :year="year" :month="month" current-view="month" />

    <st-month-calendar class="c-calendar-month__calendar" :year="year" :month="month" :events="events" />
  </section>
</template>

<script setup lang="ts">
import { addDays, getWeeksInMonth, startOfMonth, startOfWeek } from 'date-fns';

import stCalendarNav from '~/components/events/st-calendar-nav.vue';
import stMonthCalendar from '~/components/events/st-month-calendar.vue';
import type { CalendarEvent } from '~/plugins/08.cms-service';

const eventsStore = useEventsStore();
const { $cmsService } = useNuxtApp();
const { t } = useI18n();
const { month, year, monthName } = useMonthParams();

defineI18nRoute({
  paths: {
    fr: '/calendrier/[year]/[month]/mois',
    de: '/kalendar/[year]/[month]/monat',
  },
});

// We load the event types only if we don't have them already
if (!eventsStore.eventTypes) {
  await eventsStore.loadEventTypes();
}

const { data: events } = useAsyncData<CalendarEvent[]>(
  'events',
  async () => {
    const firstDayOfMonth = startOfMonth(new Date(year.value, month.value, -1));
    const calendarFirstDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    const calendarLastDay = addDays(calendarFirstDay, getWeeksInMonth(firstDayOfMonth, { weekStartsOn: 1 }) * 7);

    const eventsResult = await $cmsService.getEvents({
      limit: 1000,
      endDateAfter: calendarFirstDay,
      startDateBefore: calendarLastDay,
    });

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }

    return eventsResult.data;
  },
  { default: () => [] },
);

useHead(() => {
  return {
    title: `${t('events.title')} - ${monthName.value}`,
    meta: [
      { property: 'og:title', content: t('events.title').toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('events.description').toString(),
      },
    ],
  };
});
</script>

<style scoped>
.c-calendar-month__calendar-navigation {
  padding-top: var(--st-length-spacing-s);
  width: 100%;
}

.c-calendar-month__calendar {
  min-height: min(60vw, 90vh);
  width: 98vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding) + 1vw);
}
</style>
