<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" main />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else>
      <p class="c-competition-edition__season">{{ seasonName }}</p>
      <h2 class="t-headline-1 c-competition-edition__title">{{ competitionEdition.name }}</h2>
      <st-select-navigation
        :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${seasonName}` })"
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
import { LeveradeFacility, LeveradeGroup, LeveradeMatch, LeveradeRound, LeveradeTeam } from '~/plugins/leverade';
import { MenuItem } from '~/store/state';
import CompetitionEdition from '~/models/competition-edition.model';
import Round from '~/models/round.model';
import Match from '~/models/match.model';
import Phase from '~/models/phase.model';
import Facility from '~/models/facility.model';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season',
      de: '/wettbewerbe/:competition/:season',
    },
  },
  data() {
    return {
      seasonName: '',
    };
  },
  async fetch() {
    const competitionEdition = await this.$cmsService.getNationalCompetitionEdition(
      this.$route.params.competition,
      this.$route.params.season
    );
    if (!competitionEdition.leverade_id) {
      throw new Error('This competition edition has no Leverade ID');
    }

    this.seasonName = competitionEdition.season.name;

    const tournamentResponse = await this.$leverade.getFullTournament(competitionEdition.leverade_id);
    const tournament = tournamentResponse.data.data;

    if (tournamentResponse.data.included) {
      const teams: LeveradeTeam[] = [];
      const groups: LeveradeGroup[] = [];
      const rounds: LeveradeRound[] = [];
      const matches: LeveradeMatch[] = [];
      const facilities: LeveradeFacility[] = [];
      tournamentResponse.data.included.forEach((entity) => {
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
          case 'match':
            matches.push(entity);
            break;
          case 'facility':
            facilities.push(entity);
            break;
          default:
        }
      });

      CompetitionEdition.insert({
        data: {
          id: tournament.id,
          name: tournament.attributes.name,
          gender: tournament.attributes.gender,
          season: this.$route.params.season,
          competition: {
            name: tournament.attributes.name,
            slug: this.$route.params.competition,
          },
          teams: teams.map((team) => {
            const avatarKeyMatchArray = team.meta.avatar.large.match(/\/(\w+)\.[0-9]/);

            return {
              id: team.id,
              name: team.attributes.name,
              avatarKey: avatarKeyMatchArray && avatarKeyMatchArray?.length > 1 ? avatarKeyMatchArray[1] : null,
              // competition_edition_id: team.relationships.registrable.data.id,
            };
          }),
          phases: groups.map((group) => {
            return {
              id: group.id,
              name: group.attributes.name,
              type: group.attributes.type,
              group: group.attributes.group,
              // competition_edition_id: group.relationships.tournament.data.id,
            };
          }),
        },
      });

      Round.insert({
        data: rounds.map((round) => {
          return {
            id: round.id,
            name: round.attributes.name,
            start_date: round.attributes.start_date,
            end_date: round.attributes.end_date,
            order: round.attributes.order,
            phase_id: round.relationships.group.data.id,
          };
        }),
      });

      Match.insert({
        data: matches.map((match) => {
          return {
            id: match.id,
            datetime: match.attributes.datetime,
            home_team_id: match.meta.home_team,
            home_team_score: Math.floor(Math.random() * 100), // TODO: replace with actual score
            away_team_id: match.meta.away_team,
            away_team_score: Math.floor(Math.random() * 100), // TODO: replace with actual score
            round_id: match.relationships.round.data.id,
            facility_id: match.relationships.facility.data ? match.relationships.facility.data.id : null,
          };
        }),
      });

      Facility.insert({
        data: facilities.map((facility) => {
          return {
            id: facility.id,
            name: facility.attributes.name,
            latitude: facility.attributes.latitude,
            longitude: facility.attributes.longitude,
            address: facility.attributes.address,
            postal_code: facility.attributes.postal_code,
            city: facility.attributes.city,
          };
        }),
      });
    }

    // If no phase is selected, we redirect to the last one
    if (!this.$route.params.phase && this.competitionEdition) {
      const lastPhasePath = this.localePath({
        name: 'competitions-competition-season-phase',
        params: {
          competition: this.$route.params.competition,
          season: this.$route.params.season,
          phase: this.competitionEdition.phases[this.competitionEdition.phases.length - 1].id,
        },
      });
      if (process.server) {
        this.$nuxt.context.redirect(lastPhasePath);
      } else if (process.client) {
        this.$router.replace(lastPhasePath);
      }
    }
  },
  computed: {
    competitionEdition() {
      return CompetitionEdition.query()
        .with('phases')
        .with('phases.rounds', (query) => query.orderBy('order'))
        .with(['phases.rounds.matches', 'phases.rounds.matches.home_team', 'phases.rounds.matches.away_team'])
        .with('competitions', (query) => {
          query.where('slug', this.$route.params.competition);
        })
        .where('season', this.$route.params.season)
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
        throw new Error('Unrecognised phase');
      }
      return phase;
    },
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
