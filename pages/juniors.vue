<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources">
    <template #after-body>
      <h4 class="t-headline-3">{{ $t('categoryDistribution.title', { season: seasonName }) }}</h4>
      <st-category-distribution-table v-if="currentSeasonStartYear" :season-start-year="currentSeasonStartYear" />
    </template>
  </st-simple-page>
</template>

<script setup lang="ts">
const seasonsStore = useSeasonsStore();
const { t } = useI18n();

const { fetchPage, title, body, keyRoles, resources } = useCatchAll();

defineI18nRoute({
  paths: {
    fr: '/juniors',
    de: '/junioren',
  },
});

fetchPage();

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
