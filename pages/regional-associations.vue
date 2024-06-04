<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('regionalAssociations.title') }}</h2>
    <p class="c-regional-associations__amount">
      {{ $t('regionalAssociations.amount', { amount: associations.length }) }}
    </p>
    <st-club-list :clubs="associations" />
  </section>
</template>

<script setup lang="ts">
import type { DirectusClub } from '~/plugins/06.directus';

const { $cmsService } = useNuxtApp();
const { t } = useI18n();

const associations = ref<DirectusClub[]>([]);

defineI18nRoute({
  paths: {
    fr: '/associations-regionales',
    de: '/regionalverbaende',
  },
});

useHead(() => {
  return {
    title: t('regionalAssociations.title').toString(),
    meta: [
      { property: 'og:title', content: t('regionalAssociations.title').toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('regionalAssociations.description').toString(),
      },
    ],
  };
});

useAsyncData('regionalAssociations', async () => {
  associations.value = await $cmsService.getClubs({ statuses: ['regional_association'] });
});
</script>

<style scoped>
.c-regional-associations__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
