<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <st-breadcrumb :items="breadcrumb" class="c-competition-edition__breadcrumb" />
      <h2 v-if="competitionEdition" class="t-headline-1 c-competition-edition__title">
        <nuxt-link :to="localePath({ name: 'competitions-competition-season' })">
          {{ competitionEdition.name }}
        </nuxt-link>
      </h2>
      <st-navigation
        v-if="showPhasesNavigation"
        :items="phasesNavigation"
        :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${season.name}` })"
        class="c-competition-edition__phase-navigation"
        small
        inverted
      />
      <nuxt-child :season="season" :phase="currentPhase" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MenuItem } from '~/store/state';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import CompetitionEdition from '~/models/competition-edition.model';
import Phase from '~/models/phase.model';
import Season from '~/models/season.model';
import { NationalCompetitionEdition } from '~/plugins/cms-service';
import {
  Leverade,
  LeveradeFaceoff,
  LeveradeFacility,
  LeveradeGroup,
  LeveradeMatch,
  LeveradeResult,
  LeveradeRound,
  LeveradeTeam,
} from '~/plugins/leverade';
import { Await } from '~/types/types.utils';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season',
      de: '/wettbewerbe/:competition/:season',
    },
  },
  asyncData({ store, route }) {
    const season: Season = store.getters.getSeasonBySlug(route.params.season);
    return { season };
  },
  data() {
    return {
      season: undefined as Season | undefined,
      rawCompetitionEdition: undefined as NationalCompetitionEdition | undefined,
      leveradeTournamentData: undefined as Await<ReturnType<Leverade['getFullTournament']>>['data'] | undefined,
      lastPhasePath: undefined as string | undefined,
    };
  },
  async fetch() {
    const rawCompetitionEditions = await this.$cmsService.getNationalCompetitionEditions({
      seasonSlug: this.$route.params.season,
      competitionSlug: this.$route.params.competition,
    });
    if (!rawCompetitionEditions || rawCompetitionEditions.length < 1) {
      throw new Error('No competition edition found');
    }
    // There should be only one edition matching the request parameters.
    if (rawCompetitionEditions.length > 1) {
      console.warn('Multiple competition editions matching the request. Taking the first one.');
    }
    const rawCompetitionEdition = rawCompetitionEditions[0];
    if (!rawCompetitionEdition.leverade_id) {
      throw new Error('This competition edition has no Leverade ID');
    }
    this.rawCompetitionEdition = rawCompetitionEdition;

    const tournamentResponse = await this.$leverade.getFullTournament(this.rawCompetitionEdition?.leverade_id!);
    this.leveradeTournamentData = tournamentResponse.data;

    try {
      if (!this.season?.leverade_id) {
        throw new Error('Season has no Leverade ID');
      }

      if (!this.competitionEdition?.lastPhase) {
        throw new Error('Competition edition does not have any phases');
      }

      let lastPhasePathName = 'competitions-competition-season-phase';
      const currentRouteName = this.getRouteBaseName(this.$route);
      if (currentRouteName?.startsWith(lastPhasePathName)) {
        lastPhasePathName = currentRouteName;
      }

      this.lastPhasePath = this.localePath({
        name: lastPhasePathName,
        params: {
          competition: this.$route.params.competition,
          season: this.$route.params.season,
          phase: this.competitionEdition?.lastPhase.id,
        },
      });
    } catch (error) {
      console.error(error);
    }

    // If no phase or match is set, redirect to the last phase
    if (
      this.lastPhasePath &&
      !this.$route.params.matchId &&
      (!this.$route.params.phase || this.$route.params.phase === 'last')
    ) {
      if (process.server) {
        this.$nuxt.context.redirect(this.lastPhasePath);
      } else if (process.client) {
        this.$router.replace(this.lastPhasePath);
      }
    }
  },
  computed: {
    competitionEdition(): CompetitionEdition | undefined {
      if (!this.rawCompetitionEdition || !this.leveradeTournamentData?.included) {
        return;
      }
      const competitionEdition = new CompetitionEdition(this.rawCompetitionEdition, this.season);

      const tournament = this.leveradeTournamentData.data;
      const teams: LeveradeTeam[] = [];
      const groups: LeveradeGroup[] = [];
      const rounds: LeveradeRound[] = [];
      const faceoffs: LeveradeFaceoff[] = [];
      const matches: LeveradeMatch[] = [];
      const facilities: LeveradeFacility[] = [];
      const results: LeveradeResult[] = [];
      this.leveradeTournamentData.included.forEach((entity) => {
        switch (entity.type) {
          case 'team':
            teams.push(entity);
            break;
          case 'group':
            groups.push(entity);
            break;
          case 'round':
            rounds.push(entity);
            break;
          case 'faceoff':
            faceoffs.push(entity);
            break;
          case 'match':
            matches.push(entity);
            break;
          case 'facility':
            facilities.push(entity);
            break;
          case 'result': {
            results.push(entity);
            break;
          }
          default:
        }
      });

      competitionEdition.addLeveradeData({ tournament, teams, groups, rounds, faceoffs, matches, facilities, results });

      return competitionEdition;
    },
    phasesNavigation(): MenuItem[] {
      if (!this.competitionEdition?.phases) {
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
      if (!this.$route.params.phase || !this.competitionEdition?.phases) {
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

      if (this.season) {
        breadcrumb.push(
          ...[
            {
              displayName: this.season.name,
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

.c-competition-edition__title a {
  color: initial;
}

.c-competition-edition__phase-navigation {
  margin-top: var(--st-length-spacing-xs);
}
</style>
