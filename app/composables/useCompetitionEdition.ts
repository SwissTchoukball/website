import CompetitionEdition from '~/models/competition-edition.model';
import type Season from '~/models/season.model';
import type { DirectusMatchAdditionalData } from '~/plugins/06.directus';
import type {
  Leverade,
  LeveradeFaceoff,
  LeveradeFacility,
  LeveradeGroup,
  LeveradeMatch,
  LeveradeResult,
  LeveradeRound,
  LeveradeTeam,
} from '~/plugins/07.leverade';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';
import type { Await } from '~/types/types.utils';

export const useCompetitionEdition = (seasonSlug: string, competitionSlug: string) => {
  const seasonsStore = useSeasonsStore();
  const { $cmsService, $leverade } = useNuxtApp();

  const season = computed<Season | undefined>(() => {
    return seasonsStore.getSeasonBySlug(seasonSlug);
  });

  // FIXME: Make the fetch status and error consider all the fetch calls.
  const {
    data: rawCompetitionEdition,
    status: fetchStatus,
    error: fetchError,
  } = useAsyncData<NationalCompetitionEdition>(
    () => `competitionEdition-${seasonSlug}-${competitionSlug}`,
    async () => {
      const rawCompetitionEditions = await $cmsService.getNationalCompetitionEditions({
        seasonSlug,
        competitionSlug,
      });
      if (!rawCompetitionEditions || rawCompetitionEditions.length < 1) {
        throw new Error('No competition edition found');
      }
      // There should be only one edition matching the request parameters.
      if (rawCompetitionEditions.length > 1) {
        console.warn('Multiple competition editions matching the request. Taking the first one.');
      }

      if (!rawCompetitionEditions[0]?.leverade_id) {
        throw new Error('This competition edition has no Leverade ID');
      }
      return rawCompetitionEditions[0];
    },
  );

  const { data: leveradeTournamentData } = useAsyncData<Await<ReturnType<Leverade['getFullTournament']>>>(
    () => `leveradeTournamentData-${seasonSlug}-${competitionSlug}-${rawCompetitionEdition.value?.leverade_id}`,
    async () => {
      if (!rawCompetitionEdition.value) {
        throw new Error('No competition edition found');
      }

      return await $leverade.getFullTournament(rawCompetitionEdition.value.leverade_id!);
    },
  );

  const { data: matchesAdditionalData } = useAsyncData<Record<string, DirectusMatchAdditionalData>>(
    () => `matchesAdditionalData-${seasonSlug}-${competitionSlug}-${leveradeTournamentData.value?.data.id}`,
    async () => {
      if (!leveradeTournamentData.value) {
        throw new Error('No Leverade tournament data found');
      }

      if (!leveradeTournamentData.value.included) {
        throw new Error('Related data is missing');
      }
      // Retrieve Directus data
      const matches = leveradeTournamentData.value.included.filter(
        (entity) => entity.type === 'match',
      ) as LeveradeMatch[];
      const additionalData = await $cmsService.getMatchesAdditionalData(matches.map((match) => +match.id));
      if (!additionalData) {
        throw new Error('Could not retrieve additional match data');
      }
      return additionalData;
    },
  );

  const competitionEdition = computed<CompetitionEdition | undefined>(() => {
    if (!rawCompetitionEdition.value || !leveradeTournamentData.value?.included) {
      return;
    }
    const competitionEdition = new CompetitionEdition(rawCompetitionEdition.value, season.value);

    const tournament = leveradeTournamentData.value?.data;
    const teams: LeveradeTeam[] = [];
    const groups: LeveradeGroup[] = [];
    const rounds: LeveradeRound[] = [];
    const faceoffs: LeveradeFaceoff[] = [];
    const matches: LeveradeMatch[] = [];
    const facilities: LeveradeFacility[] = [];
    const results: LeveradeResult[] = [];
    leveradeTournamentData.value?.included.forEach((entity) => {
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

    if (matchesAdditionalData.value) {
      competitionEdition.addDirectusData(matchesAdditionalData.value);
    }

    return competitionEdition;
  });

  return { competitionEdition, season, fetchStatus, fetchError };
};
