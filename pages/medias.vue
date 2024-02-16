<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CatchAllPage from '~/pages/_.vue';

export default defineComponent({
  extends: CatchAllPage,
  nuxtI18n: {
    paths: {
      fr: '/medias',
      de: '/medien',
    },
  },
});
</script>
