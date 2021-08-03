<template>
  <v-app>
    <h1 class="u-visually-hidden">{{ $t('title') }}</h1>
    <v-navigation-drawer v-model="drawer" right clipped fixed app class="c-default__navigation-drawer">
      <st-lang-switcher class="c-default__navigation-drawer-lang-switcher" />
      <v-list dense nav>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar clipped-right flat fixed app color="white" class="c-default__app-bar">
      <div class="c-default__logo c-default__logo--small"></div>
      <v-spacer />
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-btn icon>
          <v-icon color="primary">mdi-menu</v-icon>
        </v-btn>
      </v-app-bar-nav-icon>
    </v-app-bar>
    <header class="c-default__header">
      <div class="c-default__logo c-default__logo--large"></div>
      <st-lang-switcher class="c-default__header-lang-switcher" />
      <nav class="c-default__main-nav">
        <v-menu
          v-for="(item, itemIndex) in items"
          :key="itemIndex"
          offset-y
          rounded="0"
          transition="slide-y-transition"
        >
          <template #activator="{ on, attrs }">
            <v-btn text tile :ripple="false" v-bind="attrs" v-on="on">{{ item.title }}</v-btn>
            <!-- <button v-bind="attrs" v-on="on">Fédération</button> -->
          </template>
          <v-list>
            <v-list-item v-for="(subitem, subItemIndex) in items" :key="subItemIndex" :to="subitem.to" router exact>
              <v-list-item-title>{{ subitem.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </nav>
    </header>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer absolute app>
      <span>&copy; {{ new Date().getFullYear() }} {{ $t('title') }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import StLangSwitcher from '~/components/st-language-switcher.vue';
export default Vue.extend({
  components: {
    StLangSwitcher,
  },
  data() {
    return {
      drawer: false,
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
  display: none; /* Hidden on mobile */
  width: 100%;
  max-width: var(--st-length-main-content-max-width);
  margin: auto;
  padding: var(--st-length-spacing-xs);
  padding-bottom: 0;
  position: relative;
}

.c-default__header-main {
  display: flex;
  align-items: center;
}

.c-default__logo {
  background-image: url('/images/logo-swiss-tchoukball.svg'), url('/images/wordmark-swiss-tchoukball.svg');
  background-repeat: no-repeat, no-repeat;
}

.c-default__logo--large {
  height: 80px;
  background-size: contain, 400px;
  background-position: 0, 150px;
}

.c-default__logo--small {
  width: 100%;
  height: 100%;
  background-size: 50px, 180px;
  background-position: 0, 60px;
}

.c-default__main-nav {
  margin-top: var(--st-length-spacing-xs);
}

.c-default__navigation-drawer-lang-switcher {
  padding: var(--st-length-spacing-xs);
}

.c-default__header-lang-switcher {
  padding: var(--st-length-spacing-xs);
  position: absolute;
  top: 0;
  right: 0;
}

@media (--md-and-up) {
  .c-default__app-bar,
  .c-default__navigation-drawer {
    display: none;
  }
  .c-default__header {
    display: block;
  }
}
</style>
