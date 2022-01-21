import { NuxtConfig } from '@nuxt/types/config';

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head() {
    const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true });
    return {
      titleTemplate: (titleChunk) => {
        // If undefined or blank then we don't need the hyphen
        return titleChunk ? `${titleChunk} - ${this.$t('title')}` : this.$t('title');
      },
      htmlAttrs: {
        ...i18nHead.htmlAttrs,
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          hid: 'description',
          name: 'description',
          content: this.$t('defaultDescription'),
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content:
            'tchoukball, tchouk, tchouk-ball, sport, sport pour tous, fair-play, accessible, intense, tactique, prix thulin, Swiss Tchoukball, fédération, verband, federazione, federation, switzerland, suisse, schweiz, svizerra',
        },
        { property: 'og:site_name', content: this.$t('title') },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('defaultDescription'),
          template: (chunk) => {
            return chunk || this.$t('defaultDescription');
          },
        },
        {
          hid: 'og:type',
          property: 'og:type',
          content: `website`,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: `${this.$config.websiteBaseUrl}${this.$route.path}`,
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: `${this.$config.websiteBaseUrl}/images/og-swiss-tchoukball.jpg`,
        },
        {
          hid: 'og:image:alt',
          property: 'og:image:alt',
          content: 'Logo of Swiss Tchoukball over a background featuring the net of a tchoukball frame.',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:site',
          content: '@SwissTchoukball',
        },
        ...i18nHead.meta,
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff0000' },
        ...i18nHead.link,
      ],
    };
  },

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
    ['nuxt-matomo', { matomoUrl: '//analytics.tchoukball.ch/', siteId: 4, cookies: false }],
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
    strategy: 'prefix',
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
      to: 'info@tchoukball.ch',
      from: `Swiss Tchoukball <no-reply@tchoukball.ch>`,
    },
    // TODO: Consider using a dedicated service like Mailgun or Mailtrap
    smtp: {
      host: 'mail.infomaniak.com',
      port: 587,
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
        'faAngleDoubleLeft',
        'faAngleRight',
        'faAngleDoubleRight',
        'faRss',
        'faMapMarkerAlt',
        'faClock',
        'faUser',
        'faEnvelope',
        'faAsterisk',
        'faShieldAlt',
        'faHashtag',
        'faPlayCircle',
        'faDotCircle',
        'faAward',
        'faSearch',
        'faTimes',
        'faLink',
        'faFile',
        'faFilePdf',
        'faFileArchive',
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
};

export default config;
