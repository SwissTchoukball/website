<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <h3 class="t-headline-2">{{ $t('newsletter.confirmation.title') }}</h3>
    <p class="l-paragraph">{{ $t('newsletter.confirmation.body') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import newsletterMixin from '~/mixins/newsletter.mixin';

export default Vue.extend({
  mixins: [newsletterMixin],
  head() {
    return {
      title: this.$t('newsletter.headTitle').toString(),
    };
  },
});
</script>
