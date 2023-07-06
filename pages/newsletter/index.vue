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
          'eyJpdiI6IkxiOHNud2t4bXNxb0g3YlMzenZUdktnOTZsN01SWUl5T0xoSm40cThLVG89IiwidmFsdWUiOiI3MldEZlAxUUZqelBicDJ5aCthcm1JMVVKaEpWMHROVExCUDFKXC9oaFIrST0iLCJtYWMiOiI4YTFhNDUxYzJmNzI4NWQ2ZTMyODNiNTA5OWFlMGRlNjAwMzZhZTU1NmEwMjk1ZWVjNzJjNjIzZDM4ZjU2ZWFiIn0=',
        'medias-de':
          'eyJpdiI6IjRvUE5KK0tpb080R1g1T3VwMFpzVGlDZXBiZG91bjdpRFJINGtZSjZBYXM9IiwidmFsdWUiOiJWZlNKVVwvSWhsT2xVMWZDYTJIa0szYXZLTjhcL3lkTXdJWXJkU1EzSFZUM2M9IiwibWFjIjoiNDdiNmU1NzA0MDVjOGMxZDk3ZGI4MTNjMmFlYmQ3NmY4NjA1MzE5ZDIyNjZhNWEzYmU5YjE5N2YzZjY2YzNiMiJ9',
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
