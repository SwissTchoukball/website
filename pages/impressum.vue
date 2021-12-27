<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script lang="ts">
import Vue from 'vue';
import CatchAllPage from '~/pages/_.vue';

export default Vue.extend({
  extends: CatchAllPage,
});
</script>
