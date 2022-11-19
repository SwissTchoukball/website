import { NuxtConfig } from '@nuxt/types/config';

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  // head: {},
  // `head` is defined in layouts/default.vue because if we do it here, nuxt-matomo does not work
  // See https://github.com/nuxt-community/i18n-module/issues/1266#issuecomment-982527874

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/variables.css',
    '~/assets/css/typography.css',
    '~/assets/css/main.css',
    '~/assets/css/forms.css',
    'vue-slick-carousel/dist/vue-slick-carousel.css',
    'v-tooltip/dist/v-tooltip.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
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

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxt/postcss8',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    '@nuxtjs/fontawesome',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://i18n.nuxtjs.org/
    '@nuxtjs/i18n',
    // https://github.com/dword-design/nuxt-mail
    'nuxt-mail',
    // https://github.com/pimlie/nuxt-matomo
    [
      'nuxt-matomo',
      {
        matomoUrl: 'https://analytics.tchoukball.ch/',
        siteId: process.env.MATOMO_SITE_ID,
        cookies: false,
        debug: process.env.MATOMO_DEBUG,
      },
    ],
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.ST_WEBSITE_BASE_URL,
  },

  // Nuxt i18n module configuration: https://i18n.nuxtjs.org/options-reference
  i18n: {
    locales: [
      { code: 'fr', iso: 'fr', name: 'FR', file: 'fr.json' },
      { code: 'de', iso: 'de', name: 'DE', file: 'de.json' },
    ],
    baseUrl: process.env.ST_WEBSITE_BASE_URL,
    defaultLocale: 'fr',
    langDir: 'locales/',
    strategy: 'prefix_and_default',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: false,
    },
    vueI18n: {
      fallbackLocale: 'fr',
    },
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

  // @nuxtjs/fontawesome configuration: https://github.com/nuxt-community/fontawesome-module#module-options
  fontawesome: {
    component: 'fa',
    suffix: true,
    icons: {
      solid: [
        'faAngleLeft',
        'faAnglesLeft',
        'faAngleRight',
        'faAnglesRight',
        'faSquareRss',
        'faLocationDot',
        'faClock',
        'faUser',
        'faEnvelope',
        'faAsterisk',
        'faShieldHalved',
        'faHashtag',
        'faCirclePlay',
        'faCircleDot',
        'faAward',
        'faMagnifyingGlass',
        'faTimes',
        'faLink',
        'faFile',
        'faFilePdf',
        'faFileZipper',
        'faQuestion',
        'faNewspaper',
      ],
      brands: ['faTwitter', 'faInstagram', 'faFacebook', 'faFlickr', 'faYoutube'],
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vue-tooltip'],
    postcss: {
      plugins: {
        'postcss-custom-media': {
          // See options: https://github.com/postcss/postcss-custom-media#options
          importFrom: [
            {
              // Somehow, having those defined in variables.css doesn't work.
              // That's why we defined the viewports here.
              customMedia: {
                '--xs-only': '(max-width: 600px)',
                '--sm-and-up': '(min-width: 601px)',
                '--md-and-up': '(min-width: 961px)',
                '--lg-and-up': '(min-width: 1265px)',
                '--xl-and-up': '(min-width: 1905px)',
              },
            },
          ],
        },
      },
    },
  },
  publicRuntimeConfig: {
    cmsURL: process.env.CMS_URL || 'http://localhost:8055',
    websiteBaseUrl: process.env.ST_WEBSITE_BASE_URL,
    leveradeURL: 'https://api.leverade.com',
    keyVisualSizes: [326, 500, 680, 1000, 1400, 2000, 2800],
    avatarAssetsSize: [200, 400],
    competitionLogoAssetsSizes: [200, 400],
    ogImageParams: {
      width: 1200,
      height: 630,
      fit: 'cover',
    },
    hCaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY,
    flickr: {
      userId: '128998613@N07',
      // It's okay to use the API key from the browser
      // https://github.com/flickr/flickr-sdk#browser-usage
      apiKey: process.env.FLICKR_API_KEY,
    },
  },
  serverMiddleware: [
    {
      path: '/',
      handler: '~/server-middleware/redirects.ts',
    },
  ],
};

export default config;
