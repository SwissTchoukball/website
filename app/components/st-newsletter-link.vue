<template>
  <nuxt-link :to="localePath('newsletter')" class="c-newsletter-link">{{ $t('newsletter.linkCta') }}</nuxt-link>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
</script>

<style scoped>
.c-newsletter-link {
  display: inline-block;
  padding: var(--st-length-spacing-xxs);
  color: var(--st-color-footer-newsletter);
  font-weight: bold;
  text-decoration: none;
  border: 2px solid var(--st-color-footer-newsletter);
}

.c-newsletter-link:hover {
  background-color: var(--st-color-footer-newsletter);
  color: white;
}
</style>
