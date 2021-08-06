<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ title }}</h2>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="body"></div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped>
.c-dynamic-page__body {
  margin-top: var(--st-length-spacing-s);
}
</style>
