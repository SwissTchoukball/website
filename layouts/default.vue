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
      <nuxt-link class="c-default__logo" :to="localePath('index')" @click="closeDrawer()" />
      <st-language-switcher class="c-default__header-lang-switcher" />
      <st-burger-button v-model="isDrawerOpen" class="c-default__burger-button" />
      <st-navigation :items="mainNavigation" :name="$t('mainNavigation')" class="c-default__header-navigation" />
    </header>
    <st-live-stream-banner :live-streams="liveStreams" />
    <main>
      <slot />
    </main>
    <st-footer />
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '~/plugins/08.cms-service';

const localePath = useLocalePath();
const navigationStore = useNavigationStore();
const liveStreamsStore = useLiveStreamsStore();

const isDrawerOpen = ref(false);

const mainNavigation = computed<MenuItem[]>(() => {
  return navigationStore.mainNavigation;
});

const secondaryNavigation = computed<MenuItem[]>(() => {
  return navigationStore.secondaryNavigation;
});

const liveStreams = computed<LiveStream[]>(() => {
  return liveStreamsStore.liveStreams;
});

onMounted(() => {
  // Adding a specific class if the OS is Windows.
  // Enables using a custom font for Flag emojis so that they're better than the default flag emojis on Windows, which are just letters
  if (/windows/i.test(navigator.userAgent)) {
    document.body.classList.add('u-is-windows');
  }
});

const closeDrawer = () => {
  isDrawerOpen.value = false;
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

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
  transition:
    left 0.25s ease-in-out,
    opacity 0s 0.25s;
  z-index: 3;
}

.c-default__drawer--open {
  left: 0;
  opacity: 1;
  transition:
    left 0.25s ease-in-out,
    opacity 0s 0s;
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
