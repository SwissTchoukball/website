<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <p class="c-competition-edition__season">{{ competitionEdition.season.name }}</p>
      <h2 class="t-headline-1 c-competition-edition__title">
        <nuxt-link :to="lastPhasePath">
          {{ competitionEdition.name }}
        </nuxt-link>
      </h2>
      <st-select-navigation
        v-if="currentPhase"
        :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${competitionEdition.season.name}` })"
        :options="phasesNavigation"
        class="c-competition-edition__phase-navigation"
      >
        <div class="c-competition-edition__phase-navigation-toggle">
          {{ currentPhase.name }}
          <span class="c-competition-edition__phase-navigation-toggle-triangle">&#9660;</span>
        </div>
      </st-select-navigation>
      <nuxt-child :phase="currentPhase" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Store } from 'vuex';
import { Item } from '@vuex-orm/core';
import { MenuItem, RootState } from '~/store/state';
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
    if (
      !(this.$store as Store<RootState>).state.fullyLoadedCompetitionEditions.find(
        (entry) => entry.season === this.$route.params.season && entry.competition === this.$route.params.competition
      )
    ) {
      await this.$store.dispatch('loadCompetitionEdition', {
        seasonSlug: this.$route.params.season,
        competitionSlug: this.$route.params.competition,
      });
      // TODO: Load all other editions as well (just the edition, not it relations),
      // so that we can navigate through different editions
    }

    if (!this.competitionEdition) {
      throw new Error(`No edition found for this competition in this season.`);
    }

    if (!this.competitionEdition.phases.length) {
      throw new Error(`This edition does not have any phase to show.`);
    }

    this.lastPhasePath = this.localePath({
      name: 'competitions-competition-season-phase',
      params: {
        competition: this.$route.params.competition,
        season: this.$route.params.season,
        phase: this.competitionEdition.phases[this.competitionEdition.phases.length - 1].id,
      },
    });

    // If no phase or match is set, redirect to the last phase
    if (!this.$route.params.matchId && !this.$route.params.phase) {
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
  },
  watch: {
    '$route.params.competition': '$fetch',
    '$route.params.season': '$fetch',
  },
});
</script>

<style scoped>
.c-competition-edition__season {
  padding-top: var(--st-length-spacing-xs);
  font-weight: 900;
  font-size: 0.8em;
}

.c-competition-edition__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-competition-edition__title a {
  color: inherit;
}

.c-competition-edition__phase-navigation {
  margin-top: var(--st-length-spacing-xs);
}

.c-competition-edition__phase-navigation-toggle {
  margin-top: var(--st-length-spacing-xs);
  padding: var(--st-length-spacing-xxs);
  cursor: pointer;
  border: 1px solid var(--st-color-phase-select-border);
  border-radius: 5px;
}

.c-competition-edition__phase-navigation-toggle:hover {
  background-color: var(--st-color-phase-select-background-hover);
}

.c-competition-edition__phase-navigation-toggle-triangle {
  display: inline-block;
  margin-left: var(--st-length-spacing-xxs);
  font-size: 0.5em;
  transform: translateY(-0.2em);
}
</style>
