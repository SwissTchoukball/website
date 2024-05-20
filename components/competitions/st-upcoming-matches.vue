<template>
  <section
    v-if="$fetchState.pending || $fetchState.error || upcomingMatchesData.length > 0"
    class="l-main-content-section c-upcoming-matches"
  >
    <h2 class="t-headline-1">{{ $t('competitions.upcomingMatches') }}</h2>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else-if="upcomingMatchesData.length > 0">
      <ul class="u-unstyled-list c-upcoming-matches__list">
        <template v-for="matchData of upcomingMatchesData">
          <li
            v-if="matchData.match.home_team && matchData.match.away_team"
            :key="matchData.match.id"
            class="c-upcoming-matches__match"
          >
            <st-match-event-small :match="matchData.match" :competition-edition="matchData.edition" />
          </li>
        </template>
      </ul>
      <st-link-action
        v-for="edition of competitionEditions"
        :key="edition.directus_id"
        with-arrow
        :to="getPathToLastPhaseOfEdition(edition)"
        class="c-upcoming-matches__see-more-link"
      >
        {{
          $t('competitions.upcomingMatchesOfCompetition', {
            competitionName: edition.name,
          })
        }}
      </st-link-action>
    </template>
    <p v-else class="l-blank-slate-message">
      <!-- This will never be visible as we don't show the section when there are no matches. -->
      <!-- We still keep the blank slate in case we change our mind -->
      {{ $t('competitions.noUpcomingMatches') }}
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Match from '~/models/match.model';
import stMatchEventSmall from '~/components/competitions/st-match-event-small.vue';
import Phase from '~/models/phase.model';
import Season from '~/models/season.model';
import { Leverade, LeveradeFacility } from '~/plugins/leverade';
import { Await } from '~/types/types.utils';
import Team from '~/models/team.model';
import Round from '~/models/round.model';
import CompetitionEdition from '~/models/competition-edition.model';
import { NationalCompetitionEdition } from '~/plugins/cms-service';

export default defineComponent({
  components: { stMatchEventSmall },
  data() {
    return {
      leveradeUpcomingMatchData: undefined as Await<ReturnType<Leverade['getUpcomingMatches']>>['data'] | undefined,
      directusCompetitionEditions: undefined as NationalCompetitionEdition[] | undefined,
    };
  },
  async fetch() {
    const currentSeason: Season = this.$store.getters.currentSeason;
    if (!currentSeason) {
      throw new Error('Current season undefined');
    }
    if (!currentSeason.leverade_id) {
      throw new Error('Current season has no Leverade ID');
    }

    const matchesResponse = await this.$leverade.getUpcomingMatches(currentSeason.leverade_id);
    this.leveradeUpcomingMatchData = matchesResponse.data;

    this.directusCompetitionEditions = await this.$cmsService.getNationalCompetitionEditions({
      seasonSlug: currentSeason.slug,
    });
  },
  computed: {
    upcomingMatchesData(): { match: Match; edition?: CompetitionEdition }[] {
      if (!this.leveradeUpcomingMatchData?.included || !this.directusCompetitionEditions) {
        return [];
      }

      const teams: Team[] = [];
      const phases: Phase[] = [];
      const rounds: Round[] = [];
      const competitionEditions: CompetitionEdition[] = [];
      const facilities: LeveradeFacility[] = [];

      this.directusCompetitionEditions.forEach((edition) => {
        competitionEditions.push(new CompetitionEdition(edition, this.$store.getters.currentSeason));
      });
      this.leveradeUpcomingMatchData.included.forEach((entity) => {
        switch (entity.type) {
          case 'team':
            teams.push(new Team(entity));
            break;
          case 'group':
            phases.push(new Phase(entity));
            break;
          case 'round':
            rounds.push(new Round(entity));
            break;
          case 'tournament': {
            const competitionEdition = competitionEditions.find(
              (edition) => edition.leverade_id && edition.leverade_id === entity.id
            );
            competitionEdition?.addLeveradeData({ tournament: entity });
            break;
          }
          case 'facility':
            facilities.push(entity);
            break;
          default:
        }
      });

      return this.leveradeUpcomingMatchData.data.map((rawMatch) => {
        const match = new Match(rawMatch);
        match.setTeams(teams);
        match.setFacility(facilities);

        const round = rounds.find((round) => round.id === match.round_id);
        const phase = phases.find((phase) => !!round && phase.id === round.phase_id);
        const edition = competitionEditions.find(
          (competitionEdition) => !!phase && competitionEdition.leverade_id === phase.competition_edition_id
        );
        return { match, edition };
      });
    },
    competitionEditions(): CompetitionEdition[] {
      return this.upcomingMatchesData.reduce((editions, matchData) => {
        if (!matchData.edition || editions.find((edition) => edition.directus_id === matchData.edition?.directus_id)) {
          return editions;
        }
        return [...editions, matchData.edition];
      }, [] as CompetitionEdition[]);
    },
  },
  methods: {
    getPathToLastPhaseOfEdition(edition: CompetitionEdition): string {
      if (!edition.season) {
        return '';
      }
      return this.localePath({
        name: 'competitions-competition-season-phase-planning',
        params: {
          competition: edition.competition.slug,
          season: edition.season.slug,
          phase: 'last',
        },
      });
    },
  },
});
</script>

<style scoped>
.c-upcoming-matches {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-upcoming-matches__list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.c-upcoming-matches__match {
  margin-top: var(--st-length-spacing-xs);
  padding-right: var(--st-length-spacing-xs);
  width: 100%;
}

.c-upcoming-matches__see-more-link {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-xs);
}

@media (--sm-and-up) {
  .c-upcoming-matches__list {
    flex-wrap: wrap;
    max-height: 13em;
  }

  .c-upcoming-matches__match {
    width: 50%;
  }
}

@media (--lg-and-up) {
  .c-upcoming-matches__match {
    width: 33%;
  }
}
</style>
