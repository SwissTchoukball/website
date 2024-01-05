<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-season__title">{{ $tc('season.name', seasons.length) }}</h2>

    <st-link-list
      :items="seasonsNavigation"
      :name="$t('otherNavigation', { name: $tc('season.name', seasons.length) })"
      class="c-seasons__list"
    />

    <p class="l-paragraph">{{ $t('season.previousSeasonsExplanation') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Season from '~/models/season.model';
import { DirectusSeason } from '~/plugins/directus';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/saisons',
      de: '/saisonen',
    },
  },
  computed: {
    seasons(): Season[] {
      return (this.$store.state.seasons as DirectusSeason[]).map((season) => new Season(season));
    },
    seasonsNavigation(): MenuItem[] {
      return this.seasons.map((season) => {
        return {
          name: season.name,
          href: this.localePath({ name: 'seasons-season', params: { season: season.slug } }),
        };
      });
    },
  },
});
</script>

<style scoped>
.c-seasons__list {
  margin-top: var(--st-length-spacing-s);
}
</style>
