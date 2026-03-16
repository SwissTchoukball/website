<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <p class="l-paragraph">{{ $t(`newsletter.${selectedNewsletter}.description`) }}</p>
    <form
      method="post"
      :action="`https://newsletter.infomaniak.com/v3/api/1/newsletters/webforms/${selectedNewsletterParams.id}/submit`"
      class="l-form c-newsletter__form"
    >
      <input type="email" name="email" :style="{ display: 'none' }" />
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
      <client-only>
        <altcha-widget
          hidelogo
          hidefooter
          floating
          challengeurl="https://newsletter.infomaniak.com/v3/altcha-challenge"
        >
          <!-- // eslint-disable-next-line vue/html-self-closing -->
        </altcha-widget>
      </client-only>
      <st-button type="submit" variant="primary" class="l-form__submit-button">{{
        $t('newsletter.register')
      }}</st-button>
    </form>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { selectedNewsletter } = useNewsletter();

const newsletterParams = ref<{ [key: string]: { key: string; id: string } }>({
  general: {
    key: 'eyJpdiI6InpENTdOTW1reVA5cXZYWm5jeFFPRGpDN3pSTDc0dCtvR01xWHZ0VXRiaVU9IiwibWFjIjoiZmJkNTc2MGNiZTQyOTJkOTE2MGJiOTRjMjgzYzQzMjE2Y2JhZWI5NWU2MzJmOTI2MGU4OGZkMDI0ZjNlNTc2ZiIsInZhbHVlIjoidStZbldTSGVzWGlubDhvMGIyNlIxcEI0S0kybEFicUIzN2VPNit1T2NyTT0ifQ==',
    id: '239',
  },
  instructors: {
    key: 'eyJpdiI6InVhWEZLRnpUSVdxQlM2ZTFpWlNSMU1EN28zdHZSdENFUFpKWmY0M2ZZZ2c9IiwibWFjIjoiZGFhMTA2MmUzYTc4NGVkNmUzZGEwY2RjNWY4ZWRlZmZmMDI1ZTc5NTA1ZjljYjRhYzM5M2RhNWU4YjRkN2FjZSIsInZhbHVlIjoieXpDK3dMelIrMjNIRWo1eTBRM2lab0JUblB6SXZ3T3Z6UVRCYVliQnU0MD0ifQ==',
    id: '9880',
  },
  'medias-fr': {
    key: 'eyJpdiI6IjRrODAzdldRTEE1bVwvUFA1WGNuQVg4VXlWMUg5VFNlcHYrdmJJUXpWR0JRPSIsIm1hYyI6IjVmYTlkYjRhMjc1MTc3YTVmOGM1ZjExNjZhNmNkY2MwMTlkNzA2YTg3YjM4MjhkYWVmN2M4MzYyOWUxZDRkZGIiLCJ2YWx1ZSI6IktzRURCZmdYdElcL1ZqMndiQUl2OVdXUnhQUHVRSlwvUjViVnBpd1BTT1lXQT0ifQ==',
    id: '14829',
  },
  'medias-de': {
    key: 'eyJpdiI6Ik9zenR0TVV3czFuQWpEazV0ZDQ1V2lhekdENmFoUTlRdDM1N1JVY1NvbEU9IiwibWFjIjoiNzdhMWRkYmY0YjQ1OTgyYjk5ZGY0MWZhY2Q0ZWYyOGJhZWFkMjcxNmFiOWRjNjk5NmYxZDY5Zjk0YTRhNDYxZiIsInZhbHVlIjoiYWpaazA4VUk4Yml0OHhRd1wvblZER3k4eWFFUld4U3U1YVpDMW1hcUx4Vjg9In0=',
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
    script: [
      {
        src: 'https://newsletter.infomaniak.com/v3/static/webform_index.js?v=1773689374',
      },
      {
        src: 'https://newsletter.storage5.infomaniak.com/mcaptcha/altcha.js',
        defer: true,
      },
      {
        src: 'https://eu.altcha.org/js/latest/altcha.min.js',
        type: 'module',
        defer: true,
      },
    ],
  };
});

const selectedNewsletterParams = computed<{ key: string; id: string }>(() => {
  let selected = newsletterParams.value[selectedNewsletter.value as NewsletterSlug];
  if (!selected) {
    selected = newsletterParams.value['general']!;
  }
  return selected;
});
</script>

<style scoped>
.c-newsletter__form {
  max-width: 30rem;
  margin: var(--st-length-spacing-s) auto 0;
}
</style>
