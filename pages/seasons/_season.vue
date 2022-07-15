<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-season__breadcrumb" />
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ $tc('season.name', 1) }} {{ season.name }}</h2>
      <h3 class="t-headline-2">{{ $t('competitions.title') }}</h3>
      <p class="l-paragraph">
        <ul class="c-season__list l-link-list">
          <li v-for="competitionEdition in competitionEditions" :key="competitionEdition.id" class="l-link-list-item">
            <nuxt-link
              class="c-season__item-link"
              :to="
                localePath({
                  name: 'competitions-competition-season',
                  params: { season: season.slug, competition: competitionEdition.competition.slug },
                })
              "
            >
              {{ competitionEdition.name }}
            </nuxt-link>
          </li>
        </ul>
      </p>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collection, Item } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';
import Season from '~/models/season.model';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/saisons/:season',
      de: '/saisonen/:season',
    },
  },
  data() {
    return {
      breadcrumb: [
        {
          pageName: 'seasons',
          displayName: this.$tc('season.name', 2),
        },
      ] as BreadcrumbItem[],
    }
  },
  async fetch() {
    await this.$store.dispatch('loadCompetitionsOfSeason', this.$route.params.season);
  },
  computed: {
    season(): Item<Season> {
      return Season.query().where('slug', this.$route.params.season).first();
    },
    competitionEditions(): Collection<CompetitionEdition> {
      return CompetitionEdition.query()
        .with('competition')
        .whereHas('season', (query) => {
          query.where('slug', this.$route.params.season);
        })
        .all();
    },
  },
});
</script>

<style scoped>
.c-season__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-season__list {
  margin-top: var(--st-length-spacing-s);
}
</style>
