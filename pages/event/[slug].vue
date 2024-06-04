<template>
  <section class="l-main-content-section c-event-page">
    <st-breadcrumb :items="breadcrumb" />
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-event v-else-if="event" :event="event" :show-year="true" class="c-event-page__event" />
  </section>
</template>

<script setup lang="ts">
import { decode } from 'html-entities';
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { CalendarEvent } from '~/plugins/08.cms-service';
import { getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const { t } = useI18n();
const route = useRoute();
const { $cmsService } = useNuxtApp();
const eventsStore = useEventsStore();

defineI18nRoute({
  paths: {
    fr: '/evenement/[slug]',
    de: '/ereignis/[slug]',
  },
});

const event = ref<CalendarEvent>();
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'calendar',
    displayName: t('events.title'),
  },
]);

const { pending: fetchPending, error: fetchError } = useAsyncData('event', async () => {
  const slug = route.params.slug as string;
  let id: number;
  if (slug.includes('-')) {
    id = parseInt(slug.substring(0, slug.indexOf('-')));
  } else {
    id = parseInt(slug);
  }

  if (!id) {
    throw new Error('Invalid event ID');
  }

  event.value = await $cmsService.getEvent(id);

  // We load the event types only if we don't have them already
  if (!eventsStore.eventTypes) {
    await eventsStore.loadEventTypes();
  }
});

useHead(() => {
  const title = event.value?.name || '';
  const description = event.value?.description
    ? decode(event.value.description.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
    : '';

  const metaInfo = {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: description,
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: `article`,
      },
    ],
  };

  if (event.value?.image) {
    metaInfo.meta?.push(
      {
        hid: 'og:image',
        property: 'og:image',
        content: getAssetURL(runtimeConfig.public.cmsURL, event.value.image.id, appConfig.ogImageParams),
      },
      {
        hid: 'og:image:alt',
        property: 'og:image:alt',
        content: event.value.image.description || '',
      },
    );
  }

  return metaInfo;
});
</script>

<style scoped>
.c-event-page {
  margin-top: var(--st-length-spacing-xs);
}

.c-event-page__event {
  margin-top: var(--st-length-spacing-s);
}
</style>
