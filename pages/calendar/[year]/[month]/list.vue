<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ $t('events.title') }}</h2>

    <st-calendar-nav class="c-calendar-list__calendar-navigation" :year="year" :month="month" current-view="list" />

    <st-loader v-if="fetchPending" :main="true" />
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

        <st-event-list v-if="visibleEvents.length" :events="visibleEvents" class="c-calendar-list__events" />
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import stEventList from '~/components/events/st-event-list.vue';
import stCalendarNav from '~/components/events/st-calendar-nav.vue';
import type { CalendarEvent, CMSService } from '~/plugins/08.cms-service';

const { t } = useI18n();
const eventsStore = useEventsStore();
const { month, year, monthName, yearMonthString } = useMonthParams();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/calendrier/[year]/[month]/liste',
    de: '/kalendar/[year]/[month]/liste',
  },
});

const events = ref<CalendarEvent[]>([]);
const upcomingEvents = ref<CalendarEvent[]>([]);
const filteredTypeId = ref<number | undefined>(undefined);
const showUpcomingEventsOnly = ref(false);

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

const arePastEventsThisMonth = computed<boolean>(() => {
  return events.value.length !== upcomingEvents.value.length;
});

const visibleEvents = computed<CalendarEvent[]>(() => {
  return showUpcomingEventsOnly.value ? upcomingEvents.value : events.value;
});

const getEvents = async (): ReturnType<CMSService['getEvents']> => {
  // TODO: Add pagination as currently only the 50 first events in a month are visible
  return await $cmsService.getEvents({
    limit: 50,
    typeId: filteredTypeId.value,
    month: yearMonthString.value,
  });
};

const { pending: fetchPending, error: fetchError } = useAsyncData('competition', async () => {
  const eventsResult = await getEvents();

  if (!eventsResult) {
    throw new Error('Error when retrieving events');
  }

  events.value = eventsResult.data;
  upcomingEvents.value = events.value.filter((event) => event.date_end >= new Date());

  const now = new Date();
  if (
    arePastEventsThisMonth.value &&
    upcomingEvents.value.length > 0 &&
    now.getFullYear() === year.value &&
    now.getMonth() + 1 === month.value
  ) {
    showUpcomingEventsOnly.value = true;
  }

  // We load the event types only if we don't have them already
  if (!eventsStore.eventTypes) {
    await eventsStore.loadEventTypes();
  }
});
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
