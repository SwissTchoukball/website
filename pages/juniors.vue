<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources">
    <template #after-body>
      <h4 class="t-headline-3">{{ $t('categoryDistribution.title', { season: seasonName }) }}</h4>
      <st-category-distribution-table :season-start-year="currentSeasonStartYear" />
    </template>
  </st-simple-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { Store } from 'vuex';
import CatchAllPage from '~/pages/_.vue';
import { RootState } from '~/store/state';

export default Vue.extend({
  extends: CatchAllPage,
  nuxtI18n: {
    paths: {
      fr: '/juniors',
      de: '/junioren',
    },
  },
  head() {
    return {
      // We use this as any because key_role_ids comes from asyncData of the CatchAllPage and it is not recognised as being part of the Vue component.
      // This is going to be fixed in Nuxt 2.16.
      // See https://github.com/nuxt/nuxt.js/pull/9239 and https://github.com/nuxt/nuxt.js/pull/9660
      title: (this as any).title,
    };
  },
  computed: {
    currentSeasonStartYear(): number {
      return (this.$store as Store<RootState>).getters.currentSeason?.year_start;
    },
    seasonName(): string {
      return `${this.currentSeasonStartYear} - ${this.currentSeasonStartYear + 1}`;
    },
  },
});
</script>
