<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script setup lang="ts">
import { decode } from 'html-entities';

const { fetchPage, title, body, keyRoles, resources } = useCatchAll();

defineI18nRoute({
  paths: {
    fr: '/medias',
    de: '/medien',
  },
});

useHead(() => {
  return {
    title: title.value,
    meta: [
      { property: 'og:title', content: title.value },
      {
        hid: 'og:description',
        property: 'og:description',
        content: decode((body.value || '').replace(/(<([^>]+)>)/gi, '').substring(0, 250)) + '…',
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
