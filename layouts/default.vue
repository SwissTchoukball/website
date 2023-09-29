<template>
  <div>
    <h1 class="u-visually-hidden">{{ $t('title') }}</h1>
    <div class="c-default__drawer" :class="{ 'c-default__drawer--open': isDrawerOpen }">
      <st-language-switcher class="c-default__drawer-lang-switcher" />
      <st-navigation
        :items="mainNavigation"
        :name="$t('mainNavigation')"
        narrow
        class="c-default__drawer-navigation"
        @navigate="closeDrawer()"
      />
      <st-navigation
        :items="secondaryNavigation"
        :name="$t('secondaryNavigation')"
        narrow
        small
        class="c-default__drawer-navigation"
        @navigate="closeDrawer()"
      />
    </div>
    <header class="c-default__header">
      <nuxt-link class="c-default__logo" :to="localePath('index')" @click.native="closeDrawer()"></nuxt-link>
      <st-language-switcher class="c-default__header-lang-switcher" />
      <st-burger-button v-model="isDrawerOpen" class="c-default__burger-button" />
      <st-navigation :items="mainNavigation" :name="$t('mainNavigation')" class="c-default__header-navigation" />
    </header>
    <a v-for="liveStream of liveStreams" :key="liveStream.id" :href="liveStream.url" class="c-default__live-stream">
      <fa-icon icon="circle-play" />
      <span>
        {{ $t('liveBanner.live') }} <span>{{ $formatDateDistanceToNow(new Date(liveStream.stream_start)) }}</span> :
        {{ liveStream.title }}
      </span>
    </a>
    <main>
      <Nuxt />
    </main>
    <st-footer />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collection } from '@vuex-orm/core';
import LiveStream from '~/models/live-stream.model';

export default Vue.extend({
  data() {
    return {
      isDrawerOpen: false,
    };
  },
  // We define `head()` here instead of in nuxt.config.ts because when we do it there, nuxt-matomo does not work
  // See https://github.com/nuxt-community/i18n-module/issues/1266#issuecomment-982527874
  head() {
    const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true });
    return {
      titleTemplate: (titleChunk) => {
        // If undefined or blank then we don't need the hyphen
        return titleChunk ? `${titleChunk} - ${this.$t('title')}` : this.$t('title').toString();
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
          content: this.$t('defaultDescription').toString(),
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content:
            'tchoukball, tchouk, tchouk-ball, sport, sport pour tous, fair-play, accessible, intense, tactique, prix thulin, Swiss Tchoukball, fédération, verband, federazione, federation, switzerland, suisse, schweiz, svizerra',
        },
        { property: 'og:site_name', content: this.$t('title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('defaultDescription').toString(),
          template: (chunk) => {
            return chunk || this.$t('defaultDescription').toString();
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
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          hreflang: 'fr',
          href: 'https://feeds.tchoukball.ch/news-fr.xml',
          title: 'News Swiss Tchoukball en français',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          hreflang: 'de',
          href: 'https://feeds.tchoukball.ch/news-de.xml',
          title: 'Swiss Tchoukball News auf Deutsch',
        },
        ...i18nHead.link,
      ],
    };
  },
  computed: {
    mainNavigation(): any {
      return this.$store.state.mainNavigation;
    },
    secondaryNavigation(): any {
      return this.$store.state.secondaryNavigation;
    },
    LiveStream(): any {
      return this.$store.$db().model(LiveStream);
    },
    liveStreams(): Collection<LiveStream> {
      return this.LiveStream.all();
    },
  },
  mounted() {
    // Adding a specific class if the OS is Windows.
    // Enables using a custom font for Flag emojis so that they're better than the default flag emojis on Windows, which are just letters
    if (/windows/i.test(navigator.userAgent)) {
      document.body.classList.add('u-is-windows');
    }
  },
  methods: {
    closeDrawer() {
      this.isDrawerOpen = false;
    },
  },
});
</script>

<style scoped>
.c-default__header {
  height: var(--st-length-small-header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--st-length-main-content-side-padding);
  z-index: 3;
}

.c-default__logo {
  background-image: url('/images/logo-swiss-tchoukball.svg'), url('/images/wordmark-swiss-tchoukball.svg');
  background-repeat: no-repeat, no-repeat;
  width: 100%;
  height: 100%;
  background-size: 50px, 180px;
  background-position: 0, 60px;
}

.c-default__burger-button {
  margin-left: var(--st-length-spacing-s);
}

.c-default__drawer {
  background-color: var(--st-color-navigation-drawer-background);
  width: 100vw;
  opacity: 0;
  position: fixed;
  top: var(--st-length-small-header-height);
  left: 100vw;
  bottom: 0;
  transition: left 0.25s ease-in-out, opacity 0s 0.25s;
  z-index: 3;
}

.c-default__drawer--open {
  left: 0;
  opacity: 1;
  transition: left 0.25s ease-in-out, opacity 0s 0s;
}

.c-default__drawer-lang-switcher {
  padding: var(--st-length-spacing-xs);
}

.c-default__header-lang-switcher {
  display: none; /* Hidden on xs */
}

.c-default__header-navigation {
  display: none; /* Hidden on xs and sm */
  margin-top: var(--st-length-spacing-s);
}

.c-default__drawer-navigation {
  padding: var(--st-length-spacing-xs);
}

.c-default__live-stream {
  display: flex;
  gap: var(--st-length-spacing-xs);
  align-items: center;
  padding: var(--st-length-spacing-xs) var(--st-length-main-content-side-padding);
  color: var(--st-color-live-stream-foreground);
  font-weight: bold;
  background-color: var(--st-color-live-stream-background);
  text-decoration: none;
}

@media (--sm-and-up) {
  .c-default__header-lang-switcher {
    display: block;
  }

  .c-default__drawer-lang-switcher {
    display: none;
  }
}

@media (--md-and-up) {
  .c-default__header {
    height: auto;
    width: 100%;
    padding-top: var(--st-length-spacing-xs);
    position: relative;
    flex-wrap: wrap;
  }

  .c-default__logo {
    height: 80px;
    width: auto;
    flex-grow: 2;
    background-size: contain, 400px;
    background-position: 0, 150px;
  }

  .c-default__header-lang-switcher {
    align-self: flex-start;
  }

  .c-default__header-navigation {
    display: block;
    width: 100%;
  }

  .c-default__burger-button,
  .c-default__drawer {
    display: none;
  }
}

@media print {
  .c-default__header-lang-switcher,
  .c-default__header-navigation,
  .c-default__burger-button,
  .c-default__drawer {
    display: none;
  }
}
</style>
