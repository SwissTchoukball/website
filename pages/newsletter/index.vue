<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('newsletter.title') }}</h2>
    <p class="l-paragraph">{{ $t('newsletter.description') }}</p>
    <form method="post" action="https://newsletter.infomaniak.com/external/submit" class="l-form c-newsletter__form">
      <input type="email" name="email" style="display: none" />
      <input
        type="hidden"
        name="key"
        value="eyJpdiI6IjZWTmtncjJqTUh5ZmZ1Y3pmYkw3SXFOdVB0YTV3RkpPM3ZjaFZ1TmVIN2M9IiwidmFsdWUiOiJibmh4Qjl4NnRMSlI0cnJJZmFyK3dNN1FcLzVEU1dLYlpPUkFERGlxR0xkTT0iLCJtYWMiOiJjMDQyOWFlNTZmYTljMjNhZDQ4M2FlZDkyYmQ2NTY0ZjEyMzk2Yzk4ZGU2MWFmMmNlMzhhYjNkNTM2MzlmZDA3In0="
      />
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
        <small>{{ $t('newsletter.gdprDisclaimer') }}</small>
      </p>
      <st-button type="submit" primary class="l-form__submit-button">{{ $t('newsletter.register') }}</st-button>
    </form>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  head() {
    return {
      title: this.$t('newsletter.headTitle').toString(),
      meta: [
        { property: 'og:title', content: this.$t('newsletter.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('newsletter.description').toString(),
        },
      ],
    };
  },
});
</script>

<style scoped>
.c-newsletter__form {
  max-width: 30rem;
  margin: var(--st-length-spacing-s) auto 0;
}
</style>
