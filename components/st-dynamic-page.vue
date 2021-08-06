<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ title }}</h2>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="c-dynamic-page__body" v-html="body"></div>
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

<style>
/* Tyopgraphy styles (font-size, font-weight, line-height) are set in typography.css */

.c-dynamic-page__body p,
.c-dynamic-page__body ul,
.c-dynamic-page__body ol {
  margin-top: var(--st-length-spacing-xs);
}

/* We should not use h1 and h2 in the body as they are used for site and page title */
.c-dynamic-page__body h3,
.c-dynamic-page__body h4,
.c-dynamic-page__body h5 {
  margin-top: var(--st-length-spacing-s);
}
</style>
