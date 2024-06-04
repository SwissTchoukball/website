<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('clubs.title') }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else>
      <p class="c-clubs__amount">{{ $t('clubs.amountMembers', { amount: clubs.length }) }}</p>
      <st-club-list :clubs="clubs" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { DirectusClub } from '~/plugins/06.directus';

const { $cmsService } = useNuxtApp();
const { t } = useI18n();

const clubs = ref<DirectusClub[]>([]);

defineI18nRoute({
  paths: {
    fr: '/clubs',
    de: '/vereine',
  },
});

useHead(() => {
  return {
    title: t('clubs.title'),
    meta: [
      { property: 'og:title', content: t('clubs.title') },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('clubs.description'),
      },
    ],
  };
});

const { pending: fetchPending, error: fetchError } = useAsyncData('clubs', async () => {
  clubs.value = await $cmsService.getClubs({ statuses: ['active', 'passive'] });
});
</script>

<style scoped>
.c-clubs__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
