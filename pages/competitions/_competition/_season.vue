<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <st-breadcrumb :items="breadcrumb" class="c-competition-edition__breadcrumb" />
      <h2 v-if="competitionEdition" class="t-headline-1">{{ competitionEdition.name }}</h2>
      <st-navigation
        v-if="showPhasesNavigation"
        :items="phasesNavigation"
        :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${competitionEdition.season.name}` })"
        class="c-competition-edition__phase-navigation"
        small
        inverted
      />
      <nuxt-child :phase="currentPhase" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Store } from 'vuex';
import { Item } from '@vuex-orm/core';
import { MenuItem, RootState } from '~/store/state';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import CompetitionEdition from '~/models/competition-edition.model';
import Phase from '~/models/phase.model';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season',
      de: '/wettbewerbe/:competition/:season',
    },
  },
  data() {
    return {
      lastPhasePath: undefined as string | undefined,
    };
  },
  async fetch() {
    // We load all the competition data from Leverade only if we don't have it already.
    // We consider that if we have a competition in store and it has a gender (piece of data coming from Leverade),
    // then we have all the necessary related data.
    // But if we only try to load a single match, which is a child page of season,
    // then we don't load the whole competition.
    if (
      !(this.$store as Store<RootState>).state.fullyLoadedCompetitionEditions.find(
        (entry) => entry.season === this.$route.params.season && entry.competition === this.$route.params.competition
      ) &&
      !this.$route.name?.startsWith('competitions-competition-season-match-matchId')
    ) {
      await this.$store.dispatch('loadCompetitionEdition', {
        seasonSlug: this.$route.params.season,
        competitionSlug: this.$route.params.competition,
      });
    }

    try {
      this.lastPhasePath = this.localePath({
        name: 'competitions-competition-season-phase',
        params: {
          competition: this.$route.params.competition,
          season: this.$route.params.season,
          phase: CompetitionEdition.getLastPhase(this.$route.params.competition, this.$route.params.season).id,
        },
      });
    } catch (error) {
      console.error(error);
    }

    // If no phase or match is set, redirect to the last phase
    if (this.lastPhasePath && !this.$route.params.matchId && !this.$route.params.phase) {
      if (process.server) {
        this.$nuxt.context.redirect(this.lastPhasePath);
      } else if (process.client) {
        this.$router.replace(this.lastPhasePath);
      }
    }
  },
  computed: {
    competitionEdition(): Item<CompetitionEdition> {
      return CompetitionEdition.query()
        .with('phases', (query) => query.orderBy('order'))
        .with('phases.rounds', (query) => query.orderBy('order'))
        .with([
          'phases.competition_edition',
          'phases.competition_edition.season',
          'phases.rounds.faceoffs',
          'phases.rounds.faceoffs.first_team',
          'phases.rounds.faceoffs.second_team',
          'phases.rounds.faceoffs.matches',
          'phases.rounds.faceoffs.matches.home_team',
          'phases.rounds.faceoffs.matches.away_team',
          'phases.rounds.matches',
          'phases.rounds.matches.home_team',
          'phases.rounds.matches.away_team',
        ])
        .with('competition')
        .with('season')
        .whereHas('competition', (query) => {
          query.where('slug', this.$route.params.competition);
        })
        .whereHas('season', (query) => {
          query.where('slug', this.$route.params.season);
        })
        .first();
    },
    phasesNavigation(): MenuItem[] {
      if (!this.competitionEdition) {
        return [];
      }
      return this.competitionEdition.phases.map((phase) => ({
        name: phase.name,
        href: this.localePath({
          name: 'competitions-competition-season-phase',
          params: { competition: this.$route.params.competition, season: this.$route.params.season, phase: phase.id },
        }),
      }));
    },
    currentPhase(): Phase | undefined {
      if (!this.$route.params.phase || !this.competitionEdition) {
        return;
      }
      const phase = this.competitionEdition.phases.find((phase) => phase.id === this.$route.params.phase);
      if (!phase) {
        // TODO: redirect to another phase instead of throwing an error.
        throw new Error('Unrecognised phase');
      }
      return phase;
    },
    showPhasesNavigation(): boolean {
      return (
        !!this.currentPhase &&
        !!this.competitionEdition &&
        (this.phasesNavigation.length > 1 ||
          (this.phasesNavigation.length === 1 && this.phasesNavigation[0].name !== this.competitionEdition.name))
      );
    },
    breadcrumb(): BreadcrumbItem[] {
      const breadcrumb = [
        {
          pageName: 'seasons',
          displayName: this.$tc('season.name', 2),
        },
      ];

      if (this.competitionEdition) {
        breadcrumb.push(
          ...[
            {
              displayName: this.competitionEdition.season.name,
              pageName: 'seasons-season',
            },
          ]
        );
      }

      return breadcrumb;
    },
  },
  watch: {
    '$route.params.competition': '$fetch',
    '$route.params.season': '$fetch',
  },
});
</script>

<style scoped>
.c-competition-edition__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-competition-edition__phase-navigation {
  margin-top: var(--st-length-spacing-xs);
}
</style>
