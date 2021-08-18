import { NuxtConfig } from '@nuxt/types/config';

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: (titleChunk) => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} - Swiss Tchoukball` : 'Swiss Tchoukball';
    },
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff0000' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/variables.css',
    '~/assets/css/typography.css',
    '~/assets/css/main.css',
    'vue-slick-carousel/dist/vue-slick-carousel.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/v-click-outside.js', mode: 'client' },
    '~/plugins/directus.ts',
    '~/plugins/i18n.ts',
    '~/plugins/format-date.ts',
    '~/plugins/vue-slick-carousel.ts',
    '~/plugins/cms-service.ts',
    '~/plugins/flickr.ts',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    '@nuxtjs/fontawesome',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://i18n.nuxtjs.org/
    'nuxt-i18n',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Nuxt i18n module configuration: https://i18n.nuxtjs.org/options-reference
  i18n: {
    locales: [
      { code: 'fr', iso: 'fr', name: 'FR', file: 'fr.json' },
      { code: 'de', iso: 'de', name: 'DE', file: 'de.json' },
    ],
    baseUrl: 'https://tchoukball.ch',
    defaultLocale: 'fr',
    langDir: 'locales/',
    strategy: 'prefix',
    lazy: true,
    vueI18n: {
      fallbackLocale: 'fr',
    },
  },

  // @nuxtjs/fontawesome configuration: https://github.com/nuxt-community/fontawesome-module#module-options
  fontawesome: {
    component: 'fa',
    suffix: true,
    icons: {
      solid: [
        'faAngleLeft',
        'faAngleDoubleLeft',
        'faAngleRight',
        'faAngleDoubleRight',
        'faRss',
        'faMapMarkerAlt',
        'faClock',
        'faAsterisk',
        'faShieldAlt',
        'faHashtag',
        'faPlayCircle',
        'faDotCircle',
        'faAward',
      ],
      brands: ['faTwitter', 'faInstagram', 'faFacebook', 'faFlickr', 'faYoutube'],
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
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
    newsAssetsSizes: [326, 500, 680, 1000, 1400, 2000, 2800],
    avatarAssetsSize: [200, 400],
    competitionLogoAssetsSizes: [200, 400],
    flickr: {
      userId: '128998613@N07',
      // It's okay to use the API key from the browser
      // https://github.com/flickr/flickr-sdk#browser-usage
      apiKey: process.env.FLICKR_API_KEY,
    },
  },
};

export default config;
