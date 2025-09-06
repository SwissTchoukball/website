<template>
  <section
    v-if="
      fetchUpcomingMatchesPending ||
      fetchUpcomingMatchesError ||
      fetchCompetitionEditionPending ||
      fetchCompetitionEditionError ||
      upcomingMatchesData.length > 0
    "
    class="l-main-content-section c-upcoming-matches"
  >
    <h2 class="t-headline-1">{{ $t('competitions.upcomingMatches') }}</h2>
    <st-loader v-if="fetchUpcomingMatchesPending || fetchCompetitionEditionPending" :main="true" />
    <p v-else-if="fetchUpcomingMatchesError">{{ $t('error.otherError') }} : {{ fetchUpcomingMatchesError.message }}</p>
    <p v-else-if="fetchCompetitionEditionError">
      {{ $t('error.otherError') }} : {{ fetchCompetitionEditionError.message }}
    </p>
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

<script setup lang="ts">
import Match from '~/models/match.model';
import Phase from '~/models/phase.model';
import type Season from '~/models/season.model';
import type { Leverade, LeveradeFacility } from '~/plugins/07.leverade';
import type { Await } from '~/types/types.utils';
import Team from '~/models/team.model';
import Round from '~/models/round.model';
import CompetitionEdition from '~/models/competition-edition.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';

const localePath = useLocalePath();
const { $leverade, $cmsService } = useNuxtApp();
const seasonsStore = useSeasonsStore();

const currentSeason: Season | undefined = seasonsStore.currentSeason;

const {
  data: leveradeUpcomingMatchData,
  pending: fetchUpcomingMatchesPending,
  error: fetchUpcomingMatchesError,
} = useAsyncData<Await<ReturnType<Leverade['getUpcomingMatches']>>>('upcomingMatches', async () => {
  if (!currentSeason) {
    throw new Error('Current season undefined');
  }
  if (!currentSeason.leverade_id) {
    throw new Error('Current season has no Leverade ID');
  }

  return await $leverade.getUpcomingMatches(currentSeason.leverade_id);
});

const {
  data: directusCompetitionEditions,
  pending: fetchCompetitionEditionPending,
  error: fetchCompetitionEditionError,
} = useAsyncData<NationalCompetitionEdition[]>(currentSeason?.slug || 'undefined-season', async () => {
  if (!currentSeason?.leverade_id) {
    // An error is already thrown from the other useAsyncData
    return [];
  }
  return await $cmsService.getNationalCompetitionEditions({
    seasonSlug: currentSeason.slug,
  });
});

const upcomingMatchesData = computed<{ match: Match; edition?: CompetitionEdition }[]>(() => {
  if (!leveradeUpcomingMatchData.value?.included || !directusCompetitionEditions.value) {
    return [];
  }

  const teams: Team[] = [];
  const phases: Phase[] = [];
  const rounds: Round[] = [];
  const competitionEditions: CompetitionEdition[] = [];
  const facilities: LeveradeFacility[] = [];

  directusCompetitionEditions.value.forEach((edition) => {
    competitionEditions.push(new CompetitionEdition(edition, seasonsStore.currentSeason));
  });
  leveradeUpcomingMatchData.value.included.forEach((entity) => {
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
          (edition) => edition.leverade_id && edition.leverade_id === entity.id,
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

  return leveradeUpcomingMatchData.value.data.map((rawMatch) => {
    const match = new Match(rawMatch);
    match.setTeams(teams);
    match.setFacility(facilities);

    const round = rounds.find((round) => round.id === match.round_id);
    const phase = phases.find((phase) => !!round && phase.id === round.phase_id);
    const edition = competitionEditions.find(
      (competitionEdition) => !!phase && competitionEdition.leverade_id === phase.competition_edition_id,
    );
    return { match, edition };
  });
});

const competitionEditions = computed<CompetitionEdition[]>(() => {
  return upcomingMatchesData.value.reduce((editions, matchData) => {
    if (!matchData.edition || editions.find((edition) => edition.directus_id === matchData.edition?.directus_id)) {
      return editions;
    }
    return [...editions, matchData.edition];
  }, [] as CompetitionEdition[]);
});

const getPathToLastPhaseOfEdition = (edition: CompetitionEdition): string => {
  if (!edition.season) {
    return '';
  }
  return localePath({
    name: 'competitions-competition-season-phase-planning',
    params: {
      competition: edition.competition.slug,
      season: edition.season.slug,
      phase: 'last',
    },
  });
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

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
    width: calc(100% / 3);
  }
}
</style>
