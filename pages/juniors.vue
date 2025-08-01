<template>
  <st-simple-page
    v-if="page"
    :title="page.title"
    :body="page.body"
    :key-roles="page.key_roles"
    :resources="page.resources"
  >
    <template #after-body>
      <h4 class="t-headline-3">{{ $t('categoryDistribution.title', { season: seasonName }) }}</h4>
      <st-category-distribution-table v-if="currentSeasonStartYear" :season-start-year="currentSeasonStartYear" />
    </template>
  </st-simple-page>
</template>

<script setup lang="ts">
import { decode } from 'html-entities';

const seasonsStore = useSeasonsStore();
const { t } = useI18n();

const { fetchPage, page } = useCatchAll();

defineI18nRoute({
  paths: {
    fr: '/juniors',
    de: '/junioren',
  },
});

useHead(() => {
  return {
    title: page.value?.title,
    meta: [
      { property: 'og:title', content: page.value?.title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: decode((page.value?.body || '').replace(/(<([^>]+)>)/gi, '').substring(0, 250)) + '…',
      },
    ],
  };
});

// We do the try/catch here instead of within fetchPage, because otherwise, the createError function does not properly redirect to the error page.
try {
  await fetchPage();
} catch (err: any) {
  switch (err.message) {
    case 'pageNotFound':
      throw createError({ statusCode: 404, message: `Could not find page`, fatal: true });
    case 'noData':
      console.info('No data either in the requested locale or the fallback locale.');
      break;
    default:
      throw createError({ message: `Error when retrieving simple page: ${err}`, fatal: true });
  }
}

const currentSeasonStartYear = computed<number | undefined>(() => {
  return seasonsStore.currentSeason?.year_start;
});
const seasonName = computed<string>(() => {
  if (!currentSeasonStartYear.value) {
    return t('season.undefinedSeason');
  }
  return `${currentSeasonStartYear.value} - ${currentSeasonStartYear.value + 1}`;
});
</script>
