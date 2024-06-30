<template>
  <section class="l-main-content-section c-resource-page">
    <st-breadcrumb :items="breadcrumb" />
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-resource v-else-if="resource" :resource="resource" />
  </section>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { Resource } from '~/plugins/08.cms-service';

defineI18nRoute({
  paths: {
    fr: '/ressources/[slug]',
    de: '/ressourcen/[slug]',
  },
});

const { t } = useI18n();
const route = useRoute();
const resourcesStore = useResourcesStore();
const { $cmsService } = useNuxtApp();

const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'resources',
    displayName: t('resources.title'),
  },
]);

// We load the event types only if we don't have them already
if (!resourcesStore.resourceTypes) {
  await resourcesStore.loadResourceTypes();
}

const {
  data: resource,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<Resource>('resources', async () => {
  const slug = route.params.slug as string;
  let id: number;
  if (slug.includes('-')) {
    id = parseInt(slug.substring(0, slug.indexOf('-')));
  } else {
    id = parseInt(slug);
  }

  if (!id) {
    throw new Error('Invalid resource ID');
  }

  return await $cmsService.getResource(id);
});

useHead(() => {
  const title = resource.value?.name || '';

  return {
    title,
    meta: [{ property: 'og:title', content: title }],
  };
});
</script>

<style scoped>
.c-resource-page {
  margin-top: var(--st-length-spacing-xs);
}
</style>
