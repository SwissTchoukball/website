<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-season__title">{{ $t('season.name', seasonsStore.seasons.length) }}</h2>

    <st-link-list
      :items="seasonsNavigation"
      :name="$t('otherNavigation', { name: $t('season.name', seasonsStore.seasons.length) })"
      class="c-seasons__list"
    />

    <p class="l-paragraph">{{ $t('season.previousSeasonsExplanation') }}</p>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
const seasonsStore = useSeasonsStore();

defineI18nRoute({
  paths: {
    fr: '/saisons',
    de: '/saisonen',
  },
});

const seasonsNavigation = computed<MenuItem[]>(() => {
  return seasonsStore.seasons.map((season) => {
    return {
      name: season.name,
      href: localePath({ name: 'seasons-season', params: { season: season.slug } }),
    };
  });
});
</script>

<style scoped>
.c-seasons__list {
  margin-top: var(--st-length-spacing-s);
}
</style>
