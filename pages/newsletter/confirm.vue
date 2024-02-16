<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <h3 class="t-headline-2">{{ $t('newsletter.confirmation.title') }}</h3>
    <p class="l-paragraph">{{ $t('newsletter.confirmation.body') }}</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import newsletterMixin from '~/mixins/newsletter.mixin';

export default defineComponent({
  mixins: [newsletterMixin],
  head() {
    return {
      title: this.$t('newsletter.headTitle').toString(),
    };
  },
});
</script>
