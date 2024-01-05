<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-season__breadcrumb" />
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ $tc('season.name', 1) }} {{ season.name }}</h2>
      <h3 class="t-headline-2">{{ $t('competitions.title') }}</h3>
      <st-link-list
        :items="competitionEditionsNavigation"
        :name="$t('otherNavigation', { name: `${$t('competitions.title')} ${season.name}` })"
        class="c-season__competition-list"
      />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import CompetitionEdition from '~/models/competition-edition.model';
import Season from '~/models/season.model';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import { MenuItem } from '~/store/state';
import { NationalCompetitionEdition } from '~/plugins/cms-service';

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
      rawCompetitionEditions: [] as NationalCompetitionEdition[],
    };
  },
  async fetch() {
    try {
      this.rawCompetitionEditions = await this.$cmsService.getNationalCompetitionEditions({
        seasonSlug: this.$route.params.season,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Could not load the competitions for this season');
    }
  },
  computed: {
    season(): Season | undefined {
      return this.$store.getters.getSeasonBySlug(this.$route.params.season);
    },
    competitionEditions(): CompetitionEdition[] {
      return this.rawCompetitionEditions.map(
        (rawCompetitionEdition) => new CompetitionEdition(rawCompetitionEdition, this.season)
      );
    },
    competitionEditionsNavigation(): MenuItem[] {
      return this.competitionEditions.map((competitionEdition) => {
        return {
          name: competitionEdition.name,
          href: this.localePath({
            name: 'competitions-competition-season',
            params: { season: this.season?.slug || '', competition: competitionEdition.competition.slug },
          }),
        };
      });
    },
  },
});
</script>

<style scoped>
.c-season__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-season__competition-list {
  margin-top: var(--st-length-spacing-s);
}
</style>
