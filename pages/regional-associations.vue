<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('regionalAssociations.title') }}</h2>
    <p class="c-regional-associations__amount">
      {{ $t('regionalAssociations.amount', { amount: associations.length }) }}
    </p>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-club-list v-else :clubs="associations" />
  </section>
</template>

<script setup lang="ts">
import type { DirectusClub } from '~/plugins/06.directus';

const { $cmsService } = useNuxtApp();
const { t } = useI18n();

defineI18nRoute({
  paths: {
    fr: '/associations-regionales',
    de: '/regionalverbaende',
  },
});

const {
  data: associations,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<DirectusClub[]>(
  'regionalAssociations',
  async () => $cmsService.getClubs({ statuses: ['regional_association'] }),
  { default: () => [] },
);

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
</script>

<style scoped>
.c-regional-associations__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
