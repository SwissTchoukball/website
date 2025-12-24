// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  // Global page headers: https://go.nuxtjs.dev/config-head
  // head: {},
  // `head` is defined in layouts/default.vue because if we do it here, nuxt-matomo does not work
  // See https://github.com/nuxt-community/i18n-module/issues/1266#issuecomment-982527874

  css: [
    '~/assets/css/variables.css',
    '~/assets/css/typography.css',
    '~/assets/css/main.css',
    '~/assets/css/forms.css',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  postcss: {
    plugins: {
      'postcss-custom-media': {},
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'radix-vue/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/stylelint-module',
    'nuxt-mail',
  ],

  i18n: {
    locales: [
      { code: 'fr', language: 'fr', name: 'FR', file: 'fr.json' },
      { code: 'de', language: 'de', name: 'DE', file: 'de.json' },
    ],
    baseUrl: process.env.ST_WEBSITE_BASE_URL,
    defaultLocale: 'fr',
    // TODO: Switch to `prefix_and_default` if it works properly (e.g. when it won't add `/fr/` when it was not present before)
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: false,
    },
  },

  // nuxt-mail module configuration: https://github.com/dword-design/nuxt-mail#usage
  // TypeScript support was added, but it's badly typed. Thus the @ts-expect-error.
  // See https://github.com/dword-design/nuxt-mail/issues/208#issuecomment-3687233745
  mail: {
    // @ts-expect-error TypeScript support was added, but it's badly typed.
    message: {
      to: process.env.ST_CONTACT_EMAIL_RECIPIENT,
      from: `Swiss Tchoukball <no-reply@tchoukball.ch>`,
    },
    smtp: {
      // @ts-expect-error TypeScript support was added, but it's badly typed.
      host: process.env.ST_SMTP_HOST,
      port: parseInt(process.env.ST_SMTP_PORT || '25'),
      auth: {
        user: process.env.ST_SMTP_USER,
        pass: process.env.ST_SMTP_PASSWORD,
      },
    },
  },

  build: {
    transpile: ['@fortawesome/vue-fontawesome'],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('swiper-') || tag === 'altcha-widget',
    },
  },

  routeRules: {
    '/championnat': { redirect: '/competitions/ligue-a' },
    '/championnat-feminin': { redirect: '/competitions/championnat-feminin' },
    '/coupesuisse': { redirect: '/competitions/coupe-suisse' },
    '/staff': { redirect: '/structure' },
    '/wtc2023': { redirect: '/equipes-nationales/competitions/wtc2023' },
    '/wytc2023': { redirect: '/equipes-nationales/competitions/wytc2023' },
    '/etc2022': { redirect: '/equipes-nationales/competitions/etc2022' },
    '/selections-regionales-m15': { redirect: '/selections-regionales' },
    '/regionalauswahlen-u15': { redirect: '/regionalauswahlen' },
  },

  runtimeConfig: {
    public: {
      cmsURL: process.env.CMS_URL || 'http://localhost:8055',
      websiteBaseUrl: process.env.ST_WEBSITE_BASE_URL,
      leveradeURL: 'https://api.leverade.com',
      hCaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY,
      matomo: {
        siteId: process.env.MATOMO_SITE_ID,
        url: 'https://analytics.tchoukball.ch',
        debug: process.env.MATOMO_DEBUG,
      },
      flickr: {
        userId: '128998613@N07',
        // It's okay to use the API key from the browser
        // https://github.com/flickr/flickr-sdk#browser-usage
        apiKey: process.env.FLICKR_API_KEY,
      },
    },
  },
  compatibilityDate: '2024-08-31',
});
