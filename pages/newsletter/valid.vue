<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('newsletter.title') }}</h2>
    <h3 class="t-headline-2">{{ $t('newsletter.valid.title') }}</h3>
    <p class="l-paragraph">{{ $t('newsletter.valid.body') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  head() {
    return {
      title: this.$t('newsletter.headTitle').toString(),
    };
  },
});
</script>
