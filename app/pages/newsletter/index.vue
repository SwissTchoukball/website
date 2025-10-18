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
    key: 'eyJpdiI6Ilo5SjdlR0JwRHZ6eU03WkcwaGs4M3czOHBRRHFPWkhaNVl4SzhqbkFKdjg9IiwibWFjIjoiYjQzODMwZTRkZjNmY2UzNWE1N2U0NGM0NDBkZGU3ZTJjMTA2ZGIzZTE2MzMzY2RmMDJjOGE0MmMzNTQ2MzlhYiIsInZhbHVlIjoiVEhuZVU2QVgxYWViVmNad2sxMkFVUkhHZndSU3NaOW5yMHlVMjdaZzc2UT0ifQ==',
    id: '239',
  },
  instructors: {
    key: 'eyJpdiI6IkpwRXlBVnBzMWhlZmg0SHZWdU41N0lQUlZvTVwvMHc4THR4VGtFb1N1d1pFPSIsIm1hYyI6Ijc1NDI3ODNmZDg1YTU0YzhkYTZmNjhkMGUxZDBmNmJmMzg3MWY1MTAzZjY0NmUwMjVkMDgzNWQ1Y2QxN2ZlMGYiLCJ2YWx1ZSI6IldpYVRoWWVONkdsUG96aXdyVWpJRjUwcWtjM0R3a1BUZXpDb01MOExcL3dJPSJ9',
    id: '9880',
  },
  'medias-fr': {
    key: 'eyJpdiI6IkFwcGJBYlkyblViZ0Q3OTJtN1lwRDljVTlMQjhuUjE0ZXlLZG9tR2ZSajQ9IiwibWFjIjoiZmRkMWNlYTM3NzRlNGNjM2IzYTRmNWUzMWY4OGM0MDIyM2UzNTU5OTgxMzc0YTkzMDU4OTI3NmQ1MzM5OTA5OCIsInZhbHVlIjoiXC9vbFJ2b2FRWHdXbWhKM213MXJGRTdLQzhYUjJSeklyckt1alErcktlNDg9In0=',
    id: '14829',
  },
  'medias-de': {
    key: 'eyJpdiI6ImpNNXRXRFwvRlRwcnB2WjhuNjZQY25nelVsMkhrVXNNdm51ejZGT0lwOTc0PSIsIm1hYyI6ImI5NGFjNWVlOTE1MjI2Njg1NzU4YzYzZTY4NDBhZTU5NzU0YjZiNGJmYmM4YjJmMmRmOTdiMGZhZjMwNjg3OWIiLCJ2YWx1ZSI6Ikl6eXFHRlpcLzBXTUV0WlArUTZ3TlZ2SE4rUll1a1F5S2UrV0NPc1AxNmN3PSJ9',
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
