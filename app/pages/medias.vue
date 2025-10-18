<template>
  <st-simple-page
    v-if="page"
    :title="page.title"
    :body="page.body"
    :key-roles="page.key_roles"
    :resources="page.resources"
  />
</template>

<script setup lang="ts">
import { decode } from 'html-entities';

const { fetchPage, page } = useCatchAll();

defineI18nRoute({
  paths: {
    fr: '/medias',
    de: '/medien',
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
</script>
