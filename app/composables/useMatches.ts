import Match from '~/models/match.model';
import Phase from '~/models/phase.model';
import type Season from '~/models/season.model';
import type { Leverade, LeveradeFacility, LeveradePeriod, LeveradeResult } from '~/plugins/07.leverade';
import type { Await } from '~/types/types.utils';
import Team from '~/models/team.model';
import Round from '~/models/round.model';
import CompetitionEdition from '~/models/competition-edition.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';
import Faceoff from '~/models/faceoff.model';

export const useMatches = (subset: 'ongoing' | 'upcoming') => {
  const localePath = useLocalePath();
  const { $leverade, $cmsService } = useNuxtApp();
  const seasonsStore = useSeasonsStore();

  const currentSeason: Season | undefined = seasonsStore.currentSeason;

  const matchRetrievalMethodName =
    subset === 'upcoming' ? 'getUpcomingMatches' : subset === 'ongoing' ? 'getOngoingMatches' : undefined;

  if (!matchRetrievalMethodName) {
    throw new Error(`Invalid subset: ${subset}`);
  }

  const {
    data: leveradeMatchesData,
    pending: fetchMatchesPending,
    error: fetchMatchesError,
  } = useAsyncData<Await<ReturnType<Leverade['getUpcomingMatches' | 'getOngoingMatches']>>>(
    `matches-${subset}`,
    async () => {
      if (!currentSeason) {
        throw new Error('Current season undefined');
      }
      if (!currentSeason.leverade_id) {
        throw new Error('Current season has no Leverade ID');
      }

      if (subset === 'upcoming') {
        return await $leverade.getUpcomingMatches(currentSeason.leverade_id);
      } else if (subset === 'ongoing') {
        return await $leverade.getOngoingMatches(currentSeason.leverade_id);
      } else {
        throw new Error(`Invalid subset: ${subset}`);
      }
    },
  );

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

  const matchesData = computed<{ match: Match; edition?: CompetitionEdition; phase?: Phase; round?: Round }[]>(() => {
    if (!leveradeMatchesData.value?.included || !directusCompetitionEditions.value) {
      return [];
    }

    const teams: Team[] = [];
    const faceoffs: Faceoff[] = [];
    const phases: Phase[] = [];
    const rounds: Round[] = [];
    const competitionEditions: CompetitionEdition[] = [];
    const facilities: LeveradeFacility[] = [];
    const results: LeveradeResult[] = [];
    const periods: LeveradePeriod[] = [];

    directusCompetitionEditions.value.forEach((edition) => {
      competitionEditions.push(new CompetitionEdition(edition, seasonsStore.currentSeason));
    });
    leveradeMatchesData.value.included.forEach((entity) => {
      switch (entity.type) {
        case 'team':
          teams.push(new Team(entity));
          break;
        case 'faceoff':
          faceoffs.push(new Faceoff(entity));
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
        case 'result':
          results.push(entity);
          break;
        case 'period':
          periods.push(entity);
          break;
        default:
      }
    });

    return leveradeMatchesData.value.data
      .filter((rawMatch) => !rawMatch.attributes.finished)
      .map((rawMatch) => {
        const match = new Match(rawMatch);
        match.faceoff = faceoffs.find((faceoff) => faceoff.id === match.faceoff_id);
        match.setTeams(teams);
        match.setFacility(facilities);
        if (subset !== 'upcoming') {
          const matchResults = results.filter((result) => result.relationships?.match?.data?.id === match.id);
          const matchPeriods = periods.filter((period) => period.relationships?.periodable?.data?.id === match.id);
          match.setResults(matchResults);
          match.setPeriods(matchPeriods, matchResults);
        }

        const round = rounds.find((round) => round.id === match.round_id);
        const phase = phases.find((phase) => !!round && phase.id === round.phase_id);
        const edition = competitionEditions.find(
          (competitionEdition) => !!phase && competitionEdition.leverade_id === phase.competition_edition_id,
        );
        match.round_name = round?.name || null;
        match.phase_name = phase?.name || null;
        match.phase_type = phase?.type || null;
        match.competition_edition_name = edition?.name || null;
        match.pathToMatch = localePath({
          name: 'competitions-competition-season-match-matchId',
          params: {
            competition: edition?.competition.slug,
            season: edition?.season?.slug || '',
            matchId: match.id,
          },
        });
        return { match, edition, round, phase };
      });
  });

  const competitionEditions = computed<CompetitionEdition[]>(() => {
    return matchesData.value.reduce((editions, matchData) => {
      if (!matchData.edition || editions.find((edition) => edition.directus_id === matchData.edition?.directus_id)) {
        return editions;
      }
      return [...editions, matchData.edition];
    }, [] as CompetitionEdition[]);
  });

  const getPathToEditionSchedule = (edition: CompetitionEdition): string => {
    if (!edition.season) {
      return '';
    }
    return localePath({
      name: 'competitions-competition-season-planning',
      params: {
        competition: edition.competition.slug,
        season: edition.season.slug,
      },
    });
  };

  const fetchPending = computed(() => {
    return fetchMatchesPending.value || fetchCompetitionEditionPending.value;
  });
  const fetchError = computed(() => {
    return fetchMatchesError.value || fetchCompetitionEditionError.value;
  });

  return {
    matchesData,
    competitionEditions,
    getPathToEditionSchedule,
    fetchPending,
    fetchError,
  };
};
