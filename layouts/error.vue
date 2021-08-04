<template>
  <section class="l-main-content-section c-error">
    <h2 class="c-error__title">
      <template v-if="error.statusCode === 404">{{ $t('error.pageNotFound') }}</template>
      <template v-else>{{ $t('error.otherError') }}</template>
    </h2>
    <nuxt-link to="/">{{ $t('backHome') }}</nuxt-link>
  </section>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    const title = this.error.statusCode === 404 ? this.$t('error.pageNotFound') : this.$t('error.otherError');
    return {
      title,
    };
  },
};
</script>

<style scoped>
.c-error {
  text-align: center;
}

.c-error__title {
  margin-bottom: var(--st-length-spacing-s);
}
</style>
