<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script setup lang="ts">
import { decode } from 'html-entities';

/**
 * This catch-all page is used to render pages that are fully defined in Directus.
 * Based on the given path, we call the Directus API to get the page content.
 * If there's no match, we redirect to the 404 page.
 */

const { fetchPage, title, body, keyRoles, resources } = useCatchAll();

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

fetchPage();
</script>
