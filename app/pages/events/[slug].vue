<template>
  <section class="l-main-content-section c-event-type-page">
    <st-breadcrumb :items="breadcrumb" />
    <h3 class="t-headline-1">{{ $t('events.eventTypeUpcoming.title', { name: eventTypeName }) }}</h3>
    <StLoader v-if="fetchStatus === 'pending'" main />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="events.length">
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
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'calendar',
    displayName: t('events.title'),
  },
]);

// We load the event types only if we don't have them already
if (!eventsStore.eventTypes) {
  await eventsStore.loadEventTypes();
}

const slug = route.params.slug as string;
if (slug.includes('-')) {
  eventTypeId.value = parseInt(slug.substring(0, slug.indexOf('-')));
} else {
  eventTypeId.value = parseInt(slug);
}

if (!eventTypeId.value) {
  throw createError({ message: `Invalid event type ID: ${slug}`, fatal: true });
}

const {
  data: events,
  status: fetchStatus,
  error: fetchError,
} = useAsyncData<CalendarEvent[]>(
  `events-${eventTypeId.value}`,
  async () => {
    const eventsResult = await $cmsService.getEvents({
      limit: 50,
      typeId: eventTypeId.value,
      upcoming: true,
    });

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }

    return eventsResult.data;
  },
  { default: () => [] },
);

const eventTypeName = computed<string>(() => {
  if (!eventTypeId.value || !eventsStore.eventTypes?.[eventTypeId.value]?.name_plural) {
    return '';
  }
  return eventsStore.eventTypes[eventTypeId.value]!.name_plural;
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
