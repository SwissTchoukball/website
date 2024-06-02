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
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  postcss: {
    plugins: {
      'postcss-custom-media': {},
    },
  },

  // TODO: Update plugins and remove their declaration here as it is not needed any more
  //       If order is important, we should prefix their filename with numbers.
  plugins: [
    { src: '~/plugins/v-click-outside.js', mode: 'client' },
    '~/plugins/directus.ts',
    '~/plugins/i18n.ts',
    '~/plugins/format-date.ts',
    '~/plugins/vue-slick-carousel.ts',
    '~/plugins/vue-tooltip.ts',
    '~/plugins/cms-service.ts',
    '~/plugins/leverade.ts',
    '~/plugins/flickr.ts',
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/eslint', '@nuxtjs/stylelint-module', 'nuxt-mail', '@nuxt/scripts'],

  i18n: {
    locales: [
      { code: 'fr', iso: 'fr', name: 'FR', file: 'fr.json' },
      { code: 'de', iso: 'de', name: 'DE', file: 'de.json' },
    ],
    baseUrl: process.env.ST_WEBSITE_BASE_URL,
    defaultLocale: 'fr',
    langDir: 'locales/',
    // TODO: Switch to `prefix_and_default` if it works properly (e.g. when it won't add `/fr/` when it was not present before)
    strategy: 'prefix_except_default',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: false,
    },
    vueI18n: './i18n.config.ts',
  },

  // nuxt-mail module configuration: https://github.com/dword-design/nuxt-mail#usage
  mail: {
    message: {
      to: process.env.ST_CONTACT_EMAIL_RECIPIENT,
      from: `Swiss Tchoukball <no-reply@tchoukball.ch>`,
    },
    smtp: {
      host: process.env.ST_SMTP_HOST,
      port: process.env.ST_SMTP_PORT,
      auth: {
        user: process.env.ST_SMTP_USER,
        pass: process.env.ST_SMTP_PASSWORD,
      },
    },
  },

  build: {
    transpile: ['@fortawesome/vue-fontawesome'],
  },

  routeRules: {
    '/championnat': { redirect: '/competitions/ligue-a' },
    '/coupesuisse': { redirect: '/competitions/coupe-suisse' },
    '/staff': { redirect: '/structure' },
    '/wtc2023': { redirect: '/equipes-nationales/competitions/wtc2023' },
    '/wytc2023': { redirect: '/equipes-nationales/competitions/wytc2023' },
    '/etc2022': { redirect: '/equipes-nationales/competitions/etc2022' },
  },

  scripts: {
    registry: {
      matomoAnalytics: {
        siteId: process.env.MATOMO_SITE_ID,
        matomoUrl: 'https://analytics.tchoukball.ch/',
        cookies: false,
        debug: process.env.MATOMO_DEBUG,
      },
    },
  },
});
