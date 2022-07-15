<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-season__title">{{ $tc('season.name', seasons.length) }}</h2>

    <p class="l-paragraph">
      <ul class="c-seasons__list l-link-list">
        <li v-for="season in seasons" :key="season.id" class="l-link-list-item">
          <nuxt-link :to="localePath({ name: 'seasons-season', params: { season: season.slug } })">
            {{ season.name }}
          </nuxt-link>
        </li>
      </ul>
    </p>

    <p class="l-paragraph">{{ $t('season.previousSeasonsExplanation') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collection } from '@vuex-orm/core';
import Season from '~/models/season.model';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/saisons',
      de: '/saisonen',
    },
  },
  computed: {
    seasons(): Collection<Season> {
      return Season.query().orderBy('slug', 'desc').all();
    },
  },
});
</script>

<style scoped>
.c-seasons__list {
  margin-top: var(--st-length-spacing-s);
}
</style>
