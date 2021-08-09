<template>
  <div>
    <h1 class="u-visually-hidden">{{ $t('title') }}</h1>
    <div class="c-default__drawer" :class="{ 'c-default__drawer--open': isDrawerOpen }">
      <st-lang-switcher class="c-default__drawer-lang-switcher" />
      <st-main-navigation
        :items="mainNavigation"
        narrow
        class="c-default__drawer-navigation"
        @navigate="closeDrawer()"
      />
    </div>
    <header class="c-default__header">
      <nuxt-link class="c-default__logo" :to="localePath('index')" @click.native="closeDrawer()"></nuxt-link>
      <st-lang-switcher class="c-default__header-lang-switcher" />
      <st-burger-button v-model="isDrawerOpen" class="c-default__burger-button" />
      <st-main-navigation :items="mainNavigation" class="c-default__header-navigation" />
    </header>
    <main>
      <Nuxt />
    </main>
    <st-footer />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StBurgerButton from '~/components/st-burger-button.vue';
import StLangSwitcher from '~/components/st-language-switcher.vue';
import StMainNavigation from '~/components/st-main-navigation.vue';

export default Vue.extend({
  components: {
    StLangSwitcher,
    StBurgerButton,
    StMainNavigation,
  },
  data() {
    return {
      isDrawerOpen: false,
    };
  },
  head() {
    return this.$nuxtI18nHead({ addSeoAttributes: true });
  },
  computed: {
    mainNavigation() {
      return this.$store.state.mainNavigation;
    },
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
  margin-bottom: var(--st-length-spacing-s);
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
    margin-bottom: var(--st-length-spacing-s);
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
</style>
