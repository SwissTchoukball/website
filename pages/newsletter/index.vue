<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t(`newsletter.${selectedNewsletter}.title`) }}</h2>
    <p class="l-paragraph">{{ $t(`newsletter.${selectedNewsletter}.description`) }}</p>
    <form method="post" action="https://newsletter.infomaniak.com/external/submit" class="l-form c-newsletter__form">
      <input type="email" name="email" style="display: none" />
      <input type="hidden" name="key" :value="selectedNewsletterKey" />
      <input type="hidden" name="webform_id" value="239" />

      <label for="emailAddress" class="l-form__label">{{ $t('newsletter.emailAddress') }}</label>
      <input
        id="emailAddress"
        type="email"
        class="l-form__field"
        name="inf[1]"
        data-inf-meta="1"
        data-inf-error="Merci de renseigner une adresse email"
        required="required"
        placeholder="Mail"
      />
      <p class="l-paragraph">
        <small>{{ $t(`newsletter.${selectedNewsletter}.gdprDisclaimer`) }}</small>
      </p>
      <st-button type="submit" primary class="l-form__submit-button">{{ $t('newsletter.register') }}</st-button>
    </form>
  </section>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import newsletterMixin, { NewsletterSlug } from '~/mixins/newsletter.mixin';

export default (Vue as VueConstructor<Vue & InstanceType<typeof newsletterMixin>>).extend({
  mixins: [newsletterMixin],
  data() {
    return {
      newsletterKey: {
        general:
          'eyJpdiI6IjZWTmtncjJqTUh5ZmZ1Y3pmYkw3SXFOdVB0YTV3RkpPM3ZjaFZ1TmVIN2M9IiwidmFsdWUiOiJibmh4Qjl4NnRMSlI0cnJJZmFyK3dNN1FcLzVEU1dLYlpPUkFERGlxR0xkTT0iLCJtYWMiOiJjMDQyOWFlNTZmYTljMjNhZDQ4M2FlZDkyYmQ2NTY0ZjEyMzk2Yzk4ZGU2MWFmMmNlMzhhYjNkNTM2MzlmZDA3In0=',
        instructors:
          'eyJpdiI6IlVIQldOdWVXR1k2YnRYQUJPVUMzVkVtdjFRaVBYNTJiN3h0UVA5Vk91cFE9IiwidmFsdWUiOiJ6WmFZbXVCbVA4emZDcWRcL2RmS0w1U3FuTDRwR3FTYVNRNXUzMTVlQ1BMWT0iLCJtYWMiOiI2NzY1MDU1MjAxNzQyOWYzZWQ2ODA3NTAwZDgzZjNmYzA1YzVhNTM3ZjZmYzU5YmEwMWM4ZWY4MDcxNDhiNjgxIn0=',
        'medias-fr':
          'eyJpdiI6ImttdnBjOU1JR2JWclZ2VHExTmZDaUU3WUp6MlZ5QVwvWmNMWXZqSTFyNkxJPSIsInZhbHVlIjoiNXk1Z3NBUVJBTytoQjJzb0RxRllQUDlTdWNRUkRVZWZ1WFpkeFpRZUhYcz0iLCJtYWMiOiIzOGFlYmJlM2Y1NDA2N2JiNGM4YThlOWE1ZWIxZTE1OThkNTc3MDdmNThlNjNiOGE0Y2M4MGUzMDFkZGVlMjg1In0=',
        'medias-de':
          'eyJpdiI6IituQWpieFFUMkRxTnhObHVEeXZCa2hLdXRUNmFPR05kNHBNemt3ZUg1YjA9IiwidmFsdWUiOiJ1TTBINWFrS0lNWkh4d1pEeDlqN0JiTko5SEVoWVFwOGRZUnhtemRkZ3VJPSIsIm1hYyI6ImE1MGIwNzQzNTU4NmRjMjc4NmI5ZWE1YWM0MWQ3ZmM0NzJmYjYxMzU0MzdjNGZkZjZiZTI0MThmNzZlNDcxZGIifQ==',
      } as { [key: string]: string },
    };
  },
  head() {
    return {
      title: this.$t(`newsletter.${(this as any).selectedNewsletter}.headTitle`).toString(),
      meta: [
        { property: 'og:title', content: this.$t(`newsletter.${(this as any).selectedNewsletter}.title`).toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t(`newsletter.${(this as any).selectedNewsletter}.description`).toString(),
        },
      ],
    };
  },
  computed: {
    selectedNewsletterKey(): string {
      return this.newsletterKey[this.selectedNewsletter as NewsletterSlug];
    },
  },
});
</script>

<style scoped>
.c-newsletter__form {
  max-width: 30rem;
  margin: var(--st-length-spacing-s) auto 0;
}
</style>
