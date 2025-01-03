<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('contactForm.title') }}</h2>

    <form v-if="!isSent" class="l-form c-contact-form" @submit.prevent="sendMessage">
      <label for="senderName" class="l-form__label">{{ $t('contactForm.name') }}</label>
      <input
        id="senderName"
        ref="senderNameElement"
        v-model="senderName"
        type="text"
        name="senderName"
        class="l-form__field"
        :class="{ 'l-form__field--invalid': senderNameError }"
        required
        autofocus
      />
      <p class="l-form__field-error">
        <span v-if="senderNameError">{{ senderNameError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <label for="senderEmail" class="l-form__label">{{ $t('contactForm.email') }}</label>
      <input
        id="senderEmail"
        ref="senderEmailElement"
        v-model="senderEmail"
        type="email"
        name="senderEmail"
        class="l-form__field"
        :class="{ 'l-form__field--invalid': senderEmailError }"
        required
      />
      <p class="l-form__field-error">
        <span v-if="senderEmailError">{{ senderEmailError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <label for="messageBody" class="l-form__label">{{ $t('contactForm.message') }}</label>
      <textarea
        id="messageBody"
        ref="messageBodyElement"
        v-model="messageBody"
        name="messageBody"
        class="l-form__field l-form__field--message"
        :class="{ 'l-form__field--invalid': messageBodyError }"
        required
      ></textarea>
      <p class="l-form__field-error">
        <span v-if="messageBodyError">{{ messageBodyError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <vue-hcaptcha
        class="c-contact-form__captcha"
        :sitekey="runtimeConfig.public.hCaptchaSiteKey"
        :language="$i18n.locale"
        @verify="onCaptchaVerify"
        @expired="resetCaptcha"
        @challenge-expired="resetCaptcha"
        @error="onCaptchaError"
      />
      <p class="l-form__field-error">
        <span v-if="captchaError">{{ captchaError }}</span>
        <span v-else>&nbsp;</span>
      </p>

      <st-button class="l-form__submit-button" variant="primary" :disabled="isSending" @click.prevent="sendMessage">
        {{ $t('contactForm.submit') }}
      </st-button>

      <p v-if="submissionError" class="l-form__submission-error">{{ submissionError }}</p>
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

<script setup lang="ts">
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';

defineI18nRoute({
  paths: {
    fr: '/conatct',
    de: '/kontakt',
  },
});

const runtimeConfig = useRuntimeConfig();
const { t } = useI18n();
const localePath = useLocalePath();
const mail = useMail();

// Form fields elements
const senderNameElement = ref<HTMLInputElement | null>(null);
const senderEmailElement = ref<HTMLInputElement | null>(null);
const messageBodyElement = ref<HTMLInputElement | null>(null);

// Form fields values
const senderName = ref('');
const senderEmail = ref('');
const messageBody = ref('');

// Form status
const isSending = ref(false);
const isSent = ref(false);

// Form errors
const senderNameError = ref<string | null>(null);
const senderEmailError = ref<string | null>(null);
const messageBodyError = ref<string | null>(null);
const submissionError = ref<string | null>(null);

// Captcha
const captchaVerified = ref(false);
const captchaExpired = ref(false);
const captchaToken = ref<string | null>(null);
const captchaEKey = ref<string | null>(null);
const captchaError = ref<string | null>(null);

useHead(() => {
  return {
    title: t('contactForm.headTitle'),
    meta: [
      { property: 'og:title', content: t('contactForm.headTitle') },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('contactForm.description'),
      },
    ],
  };
});

const sendMessage = async () => {
  isSending.value = true;
  resetErrors();
  if (!validate()) {
    isSending.value = false;
    return;
  }

  try {
    await mail.send({
      subject: `Message de ${senderName.value} depuis tchoukball.ch`,
      replyTo: senderEmail.value,
      text:
        `*${senderName.value} <${senderEmail.value}> a envoyé un message à Swiss Tchoukball via le formulaire de contact sur tchoukball.ch:*\n\n` +
        messageBody.value,
      html:
        `<em>${senderName.value} (<a href="mailto:${senderEmail.value}">${senderEmail.value}</a>) a envoyé un message à Swiss Tchoukball via le formulaire de contact sur tchoukball.ch:</em><br/><br/>` +
        messageBody.value.replace(/\n/g, '<br/>'),
    });
    isSent.value = true;
    resetForm();
  } catch (error: any) {
    if (error.response?.data) {
      submissionError.value = error.response.data;
    } else if (error.message) {
      submissionError.value = error.message;
    } else {
      submissionError.value = error;
    }
  } finally {
    isSending.value = false;
  }
};

const validate = (): boolean => {
  if (!senderNameElement.value || !senderEmailElement.value || !messageBodyElement.value) {
    return false;
  }

  try {
    validateInput(senderNameElement.value);
  } catch (error: any) {
    senderNameError.value = error;
    return false;
  }

  try {
    validateInput(senderEmailElement.value);
  } catch (error: any) {
    senderEmailError.value = error;
    return false;
  }

  try {
    validateInput(messageBodyElement.value);
  } catch (error: any) {
    messageBodyError.value = error;
    return false;
  }

  if (!captchaVerified.value) {
    captchaError.value = captchaError.value || t('contactForm.captchaUnverified');
    return false;
  }

  return true;
};

const validateInput = (input: HTMLInputElement): boolean => {
  if (!input.checkValidity()) {
    throw input.validationMessage;
  }
  return true;
};

const resetForm = () => {
  senderName.value = '';
  senderEmail.value = '';
  messageBody.value = '';
};

const resetErrors = () => {
  senderNameError.value = null;
  senderEmailError.value = null;
  messageBodyError.value = null;
  submissionError.value = null;
};

// Captcha methods
const onCaptchaVerify = (token: string, eKey: string) => {
  captchaVerified.value = true;
  captchaToken.value = token;
  captchaEKey.value = eKey;
  captchaExpired.value = false;
  captchaError.value = null;
};

const resetCaptcha = () => {
  captchaVerified.value = false;
  captchaToken.value = null;
  captchaEKey.value = null;
  captchaExpired.value = true;
  captchaError.value = null;
};

const onCaptchaError = (err: string) => {
  captchaToken.value = null;
  captchaEKey.value = null;
  captchaError.value = err;
};
</script>

<style scoped>
.c-contact-form {
  max-width: 500px;
  margin: var(--st-length-spacing-s) auto 0;
}

.c-contact-form__captcha {
  margin-top: var(--st-length-spacing-s);
  align-self: center;
}

.c-contact-form__success-block {
  text-align: center;
  margin: var(--st-length-spacing-m) 0;
}

.c-contact-form__success-block > * {
  margin-left: auto;
  margin-right: auto;
}
</style>
