<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <p class="l-paragraph">{{ $t(`newsletter.${selectedNewsletter}.description`) }}</p>
    <form method="post" action="https://newsletter.infomaniak.com/external/submit" class="l-form c-newsletter__form">
      <input type="email" name="email" style="display: none" />
      <input type="hidden" name="key" :value="selectedNewsletterParams.key" />
      <input type="hidden" name="webform_id" :value="selectedNewsletterParams.id" />

      <label for="emailAddress" class="l-form__label">{{ $t('newsletter.emailAddress') }}</label>
      <input
        id="emailAddress"
        type="email"
        class="l-form__field"
        name="inf[1]"
        data-inf-meta="1"
        data-inf-error="Merci de renseigner une adresse email"
        required
        placeholder="Mail"
      />
      <p class="l-paragraph">
        <small>{{ $t(`newsletter.${selectedNewsletter}.gdprDisclaimer`) }}</small>
      </p>
      <st-button type="submit" primary class="l-form__submit-button">{{ $t('newsletter.register') }}</st-button>
    </form>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { selectedNewsletter } = useNewsletter();

const newsletterParams = ref<{ [key: string]: { key: string; id: string } }>({
  general: {
    key: 'eyJpdiI6IjZWTmtncjJqTUh5ZmZ1Y3pmYkw3SXFOdVB0YTV3RkpPM3ZjaFZ1TmVIN2M9IiwidmFsdWUiOiJibmh4Qjl4NnRMSlI0cnJJZmFyK3dNN1FcLzVEU1dLYlpPUkFERGlxR0xkTT0iLCJtYWMiOiJjMDQyOWFlNTZmYTljMjNhZDQ4M2FlZDkyYmQ2NTY0ZjEyMzk2Yzk4ZGU2MWFmMmNlMzhhYjNkNTM2MzlmZDA3In0=',
    id: '239',
  },
  instructors: {
    key: 'eyJpdiI6IlVIQldOdWVXR1k2YnRYQUJPVUMzVkVtdjFRaVBYNTJiN3h0UVA5Vk91cFE9IiwidmFsdWUiOiJ6WmFZbXVCbVA4emZDcWRcL2RmS0w1U3FuTDRwR3FTYVNRNXUzMTVlQ1BMWT0iLCJtYWMiOiI2NzY1MDU1MjAxNzQyOWYzZWQ2ODA3NTAwZDgzZjNmYzA1YzVhNTM3ZjZmYzU5YmEwMWM4ZWY4MDcxNDhiNjgxIn0=',
    id: '9880',
  },
  'medias-fr': {
    key: 'eyJpdiI6IkNBWE8rTmZMSUxTMXhLMG9UTXdPVnVXN3o2S3MwV242WmtVOVpkeHFUZDg9IiwidmFsdWUiOiJFVHQycFdVUHNZMVAzNEg3NUM5SDYzZXNJWnFmcHZXY0tRcFNaRkd3NStRPSIsIm1hYyI6ImNiNTYyOTZhYjVkNGRlMjZjNjRiZDg3OTk2ZTdkMDNlZDJiZTJjMDgwOTg2NWMyMTFkNWMyYTY2ZmQ0YTg2NzkifQ==',
    id: '14829',
  },
  'medias-de': {
    key: 'eyJpdiI6IlRtUzAzWTNIcUFzSHFVdFVoeFg2ZnVZV0ZSNklPVXVjakZmZzZJNWtoN0U9IiwidmFsdWUiOiIybVlZZXNMc3hMblF0K3RpQW1FTnE2dU9MS2Y2UzBWejZROFZEUzJcLzVLUT0iLCJtYWMiOiI5ZWE1MWYwY2JhNmNiOGYyMTM0YzlkOTAxMmViMTAzYmIzMzA2ZTcyMTczNTY5NTMwMDhmNDE5ODEwZjJhYjk2In0=',
    id: '14830',
  },
});

useHead(() => {
  return {
    title: t(`newsletter.${selectedNewsletter.value}.headTitle`).toString(),
    meta: [
      { property: 'og:title', content: t(`newsletter.${selectedNewsletter.value}.title`).toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t(`newsletter.${selectedNewsletter.value}.description`).toString(),
      },
    ],
  };
});

const selectedNewsletterParams = computed<{ key: string; id: string }>(() => {
  return newsletterParams.value[selectedNewsletter.value as NewsletterSlug];
});
</script>

<style scoped>
.c-newsletter__form {
  max-width: 30rem;
  margin: var(--st-length-spacing-s) auto 0;
}
</style>
