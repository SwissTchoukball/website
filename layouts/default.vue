<template>
  <div>
    <h1 class="u-visually-hidden">{{ $t('title') }}</h1>
    <div class="c-default__navigation-drawer" :class="{ 'c-default__navigation-drawer--open': isNavigationDrawerOpen }">
      <st-lang-switcher class="c-default__navigation-drawer-lang-switcher" />
      <ul class="u-unstyled-list">
        <li v-for="(item, i) in items" :key="i" :to="item.to">{{ item.title }}</li>
      </ul>
    </div>
    <header class="c-default__header">
      <div class="c-default__logo"></div>
      <st-lang-switcher class="c-default__header-lang-switcher" />
      <st-burger-button v-model="isNavigationDrawerOpen" class="c-default__burger-button" />
      <nav class="c-default__header-navigation">
        <h2 class="u-visually-hidden">{{ $t('mainNavigation') }}</h2>
        <ul class="u-unstyled-list">
          <li v-for="(item, i1) in items" :key="i1">
            <button class="u-unstyled-button">{{ item.title }}</button>
            <ul class="u-unstyled-list">
              <li v-for="(subItem, i2) in items" :key="i2">
                <nuxt-link :to="subItem.to">{{ subItem.title }}</nuxt-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
    <main>
      <Nuxt />
    </main>
    <footer>
      <span>&copy; {{ new Date().getFullYear() }} {{ $t('title') }}</span>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StBurgerButton from '~/components/st-burger-button.vue';
import StLangSwitcher from '~/components/st-language-switcher.vue';

export default Vue.extend({
  components: {
    StLangSwitcher,
    StBurgerButton,
  },
  data() {
    return {
      isNavigationDrawerOpen: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      title: 'Swiss Tchoukball',
    };
  },
});
</script>

<style>
@import '../assets/css/main.css';
@import '../assets/css/variables.css';
</style>

<style scoped>
.c-default__header {
  height: var(--st-length-small-header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.c-default__logo {
  background-image: url('/images/logo-swiss-tchoukball.svg'), url('/images/wordmark-swiss-tchoukball.svg');
  background-repeat: no-repeat, no-repeat;
  width: 100%;
  height: 100%;
  background-size: 50px, 180px;
  background-position: 0, 60px;
}

.c-default__header-navigation {
  display: none; /* Hidden on xs and sm */
  margin-top: var(--st-length-spacing-xs);
}

.c-default__burger-button {
  margin-left: var(--st-length-spacing-m);
}

.c-default__navigation-drawer {
  background-color: var(--st-color-navigation-drawer-background);
  width: 100vw;
  opacity: 0;
  position: fixed;
  top: var(--st-length-small-header-height);
  left: 100vw;
  bottom: 0;
  transition: left 0.25s ease-in-out, opacity 0s 0.25s;
}

.c-default__navigation-drawer--open {
  left: 0;
  opacity: 1;
  transition: left 0.25s ease-in-out, opacity 0s 0s;
}

.c-default__navigation-drawer-lang-switcher {
  padding: var(--st-length-spacing-xs);
}

.c-default__header-lang-switcher {
  display: none; /* Hidden on xs */
}

@media (--sm-and-up) {
  .c-default__header-lang-switcher {
    display: block;
  }

  .c-default__navigation-drawer-lang-switcher {
    display: none;
  }
}

@media (--md-and-up) {
  .c-default__header {
    height: auto;
    width: 100%;
    max-width: var(--st-length-main-content-max-width);
    margin: auto;
    padding: var(--st-length-spacing-xs);
    padding-bottom: 0;
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
  .c-default__navigation-drawer {
    display: none;
  }
}
</style>
