<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-news v-else-if="newsEntry" :news-entry="newsEntry" />
  </section>
</template>

<script setup lang="ts">
import { decode } from 'html-entities';
import type { NewsEntry } from '~/components/news/st-news';
import { getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const route = useRoute();
const { $cmsService } = useNuxtApp();

const {
  data: newsEntry,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<NewsEntry>(route.params.slug as string, async () => {
  const slug = route.params.slug as string;
  let id: number;
  if (slug.includes('-')) {
    id = parseInt(slug.substring(0, slug.indexOf('-')));
  } else {
    id = parseInt(slug);
  }

  if (!id) {
    throw new Error('Invalid news ID');
  }

  return await $cmsService.getOneNews(id);
});

useHead(() => {
  const title = newsEntry.value?.title || 'News';
  const description = newsEntry.value?.body
    ? decode(newsEntry.value.body.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
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

  if (newsEntry.value?.main_image) {
    metaInfo.meta?.push(
      {
        hid: 'og:image',
        property: 'og:image',
        content: getAssetURL(runtimeConfig.public.cmsURL, newsEntry.value.main_image.id, appConfig.ogImageParams),
      },
      {
        hid: 'og:image:alt',
        property: 'og:image:alt',
        content: newsEntry.value.main_image.description || '',
      },
    );
  }

  return metaInfo;
});
</script>
