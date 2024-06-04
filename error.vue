<template>
  <NuxtLayout>
    <section class="l-main-content-section c-error">
      <h2 class="c-error__title">{{ title }}</h2>
      <img class="c-error__image" src="/images/error-illustration.jpg" :alt="$t('error.imageDescription')" />
      <nuxt-link :to="localePath('/')">{{ $t('backHome') }}</nuxt-link>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const { t } = useI18n();
const localePath = useLocalePath();

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    default: null,
  },
});

const title = computed(() => {
  return props.error.statusCode === 404 ? t('error.pageNotFound') : t('error.otherError');
});

useHead({
  title: () => title.value,
});

console.error(props.error);
</script>

<style scoped>
.c-error {
  text-align: center;
}

.c-error__image {
  display: block;
  max-width: 100%;
  margin: auto;
}

.c-error__title {
  margin-bottom: var(--st-length-spacing-s);
}
</style>
