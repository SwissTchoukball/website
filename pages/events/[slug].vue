<template>
  <section class="l-main-content-section c-event-type-page">
    <st-breadcrumb :items="breadcrumb" />
    <h3 class="t-headline-1">{{ $t('events.eventTypeUpcoming.title', { name: eventTypeName }) }}</h3>
    <template v-if="events.length">
      <st-event-list :events="events" class="c-event-type-page__events" :show-year="true" />
    </template>
    <p v-else class="c-event-type-page__blank-slate">
      {{ $t('events.eventTypeUpcoming.none', { name: eventTypeName }) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { CalendarEvent } from '~/plugins/08.cms-service';

const route = useRoute();
const { t } = useI18n();
const { $cmsService } = useNuxtApp();
const eventsStore = useEventsStore();

defineI18nRoute({
  paths: {
    fr: '/evenements/[slug]',
    de: '/ereignisse/[slug]',
  },
});

const eventTypeId = ref<number>();
const events = ref<CalendarEvent[]>([]);
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'calendar',
    displayName: t('events.title'),
  },
]);

useAsyncData('events', async () => {
  const slug = route.params.slug as string;
  if (slug.includes('-')) {
    eventTypeId.value = parseInt(slug.substring(0, slug.indexOf('-')));
  } else {
    eventTypeId.value = parseInt(slug);
  }

  if (!eventTypeId.value) {
    throw new Error('Invalid event type ID');
  }

  const eventsResult = await $cmsService.getEvents({
    limit: 50,
    typeId: eventTypeId.value,
    upcoming: true,
  });

  if (!eventsResult) {
    throw new Error('Error when retrieving events');
  }

  events.value = eventsResult.data;

  // We load the event types only if we don't have them already
  if (!eventsStore.eventTypes) {
    await eventsStore.loadEventTypes();
  }
});

const eventTypeName = computed<string>(() => {
  return eventTypeId.value && eventsStore.eventTypes ? eventsStore.eventTypes[eventTypeId.value].name_plural : '';
});
</script>

<style scoped>
.c-event-type-page {
  margin-top: var(--st-length-spacing-xs);
}

.c-event-type-page__events {
  margin-top: var(--st-length-spacing-s);
}

.c-event-type-page__blank-slate {
  margin-top: var(--st-length-spacing-s);
}
</style>
