<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('structure.title') }}</h2>

    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-link-list
      v-else
      :items="groupsNavigation"
      :name="$t('otherNavigation', { name: $t('structure.title') })"
      class="c-structure__group-list"
    />
  </section>
</template>

<script setup lang="ts">
import type { Group } from '~/plugins/08.cms-service';

const localePath = useLocalePath();
const { t, locale } = useI18n();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/structure',
    de: '/struktur',
  },
});

useHead(() => {
  return {
    title: t('structure.title').toString(),
    meta: [{ property: 'og:title', content: t('structure.title').toString() }],
  };
});

const {
  data: groups,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<Group[]>(`groups-${locale.value}`, async () => {
  return await $cmsService.getGroups();
});

const groupsNavigation = computed<MenuItem[]>(() => {
  if (!groups.value) {
    return [];
  }

  const groupNaviation = groups.value.map((group) => ({
    name: group.name,
    href: localePath({
      name: 'structure-group',
      params: { group: group.slug },
    }),
  }));

  return [
    ...groupNaviation,
    {
      name: t('structure.staff.title').toString(),
      href: localePath({
        name: 'structure-group',
        params: { group: t('structure.staff.slug').toString() },
      }),
    },
  ];
});
</script>

<style scoped>
.c-structure__group-list {
  margin-top: var(--st-length-spacing-s);
}
</style>
