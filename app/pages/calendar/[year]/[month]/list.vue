<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ $t('events.title') }}</h2>

    <st-calendar-nav class="c-calendar-list__calendar-navigation" :year="year" :month="month" current-view="list" />

    <st-loader v-if="fetchStatus === 'pending'" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else>
      <p v-if="!events.length" class="l-blank-slate-message">{{ $t('events.noneThisMonth', { month: monthName }) }}</p>
      <template v-else>
        <st-link-action
          v-if="showUpcomingEventsOnly && arePastEventsThisMonth"
          class="c-calendar-list__past-events-link"
          @click="showUpcomingEventsOnly = false"
        >
          {{ $t('events.showPastEvents', { month: monthName }) }}
        </st-link-action>
        <st-link-action
          v-else-if="!showUpcomingEventsOnly && upcomingEvents.length > 0 && events.length !== upcomingEvents.length"
          class="c-calendar-list__past-events-link"
          @click="showUpcomingEventsOnly = true"
        >
          {{ $t('events.showUpcomingEventsOnly', { month: monthName }) }}
        </st-link-action>

        <st-event-list
          v-if="!showUpcomingEventsOnly && pastEvents.length"
          :events="pastEvents"
          class="c-calendar-list__events"
        />
        <st-event-list :events="upcomingEvents" class="c-calendar-list__events" />
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import stEventList from '~/components/events/st-event-list.vue';
import stCalendarNav from '~/components/events/st-calendar-nav.vue';
import type { CalendarEvent } from '~/plugins/08.cms-service';

const { t, locale } = useI18n();
const eventsStore = useEventsStore();
const { month, year, monthName, yearMonthString } = useMonthParams();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/calendrier/[year]/[month]/liste',
    de: '/kalendar/[year]/[month]/liste',
  },
});

const filteredTypeId = ref<number | undefined>(undefined);

useHead(() => {
  return {
    title: t('events.title').toString(),
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

// We load the event types only if we don't have them already
if (!eventsStore.eventTypes) {
  await eventsStore.loadEventTypes();
}

const {
  data: events,
  status: fetchStatus,
  error: fetchError,
} = useAsyncData<CalendarEvent[]>(
  `events-${yearMonthString.value}-${filteredTypeId.value}-${locale.value}`,
  async () => {
    // TODO: Add pagination as currently only the 50 first events in a month are visible
    const eventsResult = await $cmsService.getEvents({
      limit: 50,
      typeId: filteredTypeId.value,
      month: yearMonthString.value,
    });

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }
    return eventsResult.data;
  },
  { default: () => [] },
);
const showUpcomingEventsOnly = ref(false);

const pastEvents = computed<CalendarEvent[]>(() => {
  return events.value.filter((event) => event.date_end < new Date());
});

const upcomingEvents = computed<CalendarEvent[]>(() => {
  return events.value.filter((event) => event.date_end >= new Date());
});

const arePastEventsThisMonth = computed<boolean>(() => {
  return events.value.length !== upcomingEvents.value.length;
});

const now = new Date();
showUpcomingEventsOnly.value =
  arePastEventsThisMonth.value &&
  upcomingEvents.value.length > 0 &&
  now.getFullYear() === year.value &&
  now.getMonth() + 1 === month.value;
</script>

<style scoped>
.c-calendar-list__calendar-navigation {
  padding-top: var(--st-length-spacing-s);
  width: 100%;
}

.c-calendar-list__past-events-link {
  display: block;
  text-align: center;
  margin-top: var(--st-length-spacing-xs);
  font-size: 0.8em;
}

.c-calendar-list__events {
  margin-top: var(--st-length-spacing-s);
}
</style>
