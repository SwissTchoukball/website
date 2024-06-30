<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <h3 class="t-headline-2">{{ $t('newsletter.confirmation.title') }}</h3>
    <p class="l-paragraph">{{ $t('newsletter.confirmation.body') }}</p>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { selectedNewsletter } = useNewsletter();

useHead(() => {
  return {
    title: t(`newsletter.${selectedNewsletter.value}.headTitle`).toString(),
  };
});
</script>
