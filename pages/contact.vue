<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('contactForm.title') }}</h2>

    <form v-if="!isSent" class="c-contact-form" @submit.prevent="sendMessage">
      <label for="senderName" class="c-contact-form__label">{{ $t('contactForm.name') }}</label>
      <input
        id="senderName"
        ref="senderName"
        v-model="senderName"
        type="text"
        name="senderName"
        class="c-contact-form__field"
        :class="{ 'c-contact-form__field--invalid': senderNameError }"
        required
        autofocus
      />
      <p class="c-contact-form__field-error">
        <span v-if="senderNameError">{{ senderNameError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <label for="senderEmail" class="c-contact-form__label">{{ $t('contactForm.email') }}</label>
      <input
        id="senderEmail"
        ref="senderEmail"
        v-model="senderEmail"
        type="email"
        name="senderEmail"
        class="c-contact-form__field"
        :class="{ 'c-contact-form__field--invalid': senderEmailError }"
        required
      />
      <p class="c-contact-form__field-error">
        <span v-if="senderEmailError">{{ senderEmailError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <label for="messageBody" class="c-contact-form__label">{{ $t('contactForm.message') }}</label>
      <textarea
        id="messageBody"
        ref="messageBody"
        v-model="messageBody"
        name="messageBody"
        class="c-contact-form__field c-contact-form__field--message"
        :class="{ 'c-contact-form__field--invalid': messageBodyError }"
        required
      ></textarea>
      <p class="c-contact-form__field-error">
        <span v-if="messageBodyError">{{ messageBodyError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <vue-hcaptcha
        class="c-contact-form__captcha"
        :sitekey="$config.hCaptchaSiteKey"
        :language="$i18n.locale"
        @verify="onCaptchaVerify"
        @expired="resetCaptcha"
        @challengeExpired="resetCaptcha"
        @error="onCaptchaError"
      />
      <p class="c-contact-form__field-error">
        <span v-if="captchaError">{{ captchaError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <st-button class="c-contact-form__submit-button" primary :disabled="isSending" @click.prevent="sendMessage">
        {{ $t('contactForm.submit') }}
      </st-button>

      <p v-if="submissionError" class="c-contact-form__submission-error">{{ submissionError }}</p>
    </form>

    <div v-else class="c-contact-form__success-block">
      <h3 class="t-headline-2">{{ $t('contactForm.success.title') }}</h3>
      <p class="l-paragraph">{{ $t('contactForm.success.body') }}</p>
      <p class="l-paragraph">
        <st-link-action :to="localePath('/')">{{ $t('backHome') }}</st-link-action>
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import VueHcaptcha from '@hcaptcha/vue-hcaptcha';

export default Vue.extend({
  components: {
    VueHcaptcha,
  },
  data() {
    return {
      // Form fields
      senderName: '',
      senderEmail: '',
      messageBody: '',
      // Form status
      isSending: false,
      isSent: false,
      // Form errors
      senderNameError: null as string | null,
      senderEmailError: null as string | null,
      messageBodyError: null as string | null,
      submissionError: null as string | null,
      // Captcha
      captchaVerified: false,
      captchaExpired: false,
      captchaToken: null as string | null,
      captchaEKey: null as string | null,
      captchaError: null as string | null,
    };
  },
  head(): MetaInfo {
    return {
      title: this.$t('contactForm.headTitle').toString(),
    };
  },
  methods: {
    async sendMessage() {
      this.isSending = true;
      this.resetErrors();
      if (!this.validate()) {
        this.isSending = false;
        return;
      }

      try {
        await (this as any).$mail.send({
          subject: `Message de ${this.senderName} depuis tchoukball.ch`,
          replyTo: this.senderEmail,
          text:
            `*${this.senderName} <${this.senderEmail}> a envoyé un message à Swiss Tchoukball via le formulaire de contact sur tchoukball.ch:*\n\n` +
            this.messageBody,
          html:
            `<em>${this.senderName} (<a href="mailto:${this.senderEmail}">${this.senderEmail}</a>) a envoyé un message à Swiss Tchoukball via le formulaire de contact sur tchoukball.ch:</em><br/><br/>` +
            this.messageBody.replace(/\n/g, '<br/>'),
        });
        this.isSent = true;
        this.resetForm();
      } catch (error: any) {
        if (error.response?.data) {
          this.submissionError = error.response.data;
        } else if (error.message) {
          this.submissionError = error.message;
        } else {
          this.submissionError = error;
        }
      } finally {
        this.isSending = false;
      }
    },
    validate(): boolean {
      try {
        this.validateInput(this.$refs.senderName as HTMLInputElement);
      } catch (error: any) {
        this.senderNameError = error;
        return false;
      }

      try {
        this.validateInput(this.$refs.senderEmail as HTMLInputElement);
      } catch (error: any) {
        this.senderEmailError = error;
        return false;
      }

      try {
        this.validateInput(this.$refs.messageBody as HTMLInputElement);
      } catch (error: any) {
        this.messageBodyError = error;
        return false;
      }

      if (!this.captchaVerified) {
        this.captchaError = this.captchaError || this.$t('contactForm.captchaUnverified').toString();
        return false;
      }

      return true;
    },
    validateInput(input: HTMLInputElement): boolean {
      if (!input.checkValidity()) {
        throw input.validationMessage;
      }
      return true;
    },
    resetForm() {
      this.senderName = '';
      this.senderEmail = '';
      this.messageBody = '';
    },
    resetErrors() {
      this.senderNameError = null;
      this.senderEmailError = null;
      this.messageBodyError = null;
      this.submissionError = null;
    },
    // Captcha methods
    onCaptchaVerify(token: string, eKey: string) {
      this.captchaVerified = true;
      this.captchaToken = token;
      this.captchaEKey = eKey;
      this.captchaExpired = false;
      this.captchaError = null;
    },
    resetCaptcha() {
      this.captchaVerified = false;
      this.captchaToken = null;
      this.captchaEKey = null;
      this.captchaExpired = true;
      this.captchaError = null;
    },
    onCaptchaError(err: string) {
      this.captchaToken = null;
      this.captchaEKey = null;
      this.captchaError = err;
    },
  },
});
</script>

<style scoped>
.c-contact-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 500px;
  margin: 2rem auto 0;
}

.c-contact-form__label {
  font-size: 0.8em;
  margin-top: 1rem;
}

.c-contact-form__field {
  margin-top: 0.3rem;
  padding: 0.5rem;
  width: 100%;
  border: 1px solid var(--st-color-input-border);
  border-radius: 0.3rem;
}

.c-contact-form__field--invalid {
  border-color: var(--st-color-error);
}

.c-contact-form__field--message {
  min-height: 8rem;
}

.c-contact-form__captcha,
.c-contact-form__submit-button {
  margin-top: 2rem;
  align-self: center;
}

.c-contact-form__field-error {
  color: var(--st-color-error);
  font-size: 0.7em;
  margin-top: 0.2rem;
}

.c-contact-form__submission-error {
  color: var(--st-color-error);
  width: 100%;
  text-align: center;
  font-size: 0.8em;
  margin-top: 1rem;
}

.c-contact-form__success-block {
  text-align: center;
  margin: 3rem 0;
}
</style>
