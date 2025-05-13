<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchStatus === 'pending' || route.params.phase === 'last'" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else>
      <st-breadcrumb :items="breadcrumb" class="c-competition-edition__breadcrumb" />

      <h2 v-if="competitionEdition" class="t-headline-1 c-competition-edition__title">
        <nuxt-link :to="localePath({ name: 'competitions-competition-season' })">
          {{ competitionEdition.name }}
        </nuxt-link>
      </h2>
      <st-navigation
        v-if="showPhasesNavigation && competitionEdition && season"
        :items="phasesNavigation"
        :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${season.name}` })"
        class="c-competition-edition__phases-navigation"
        small
        inverted
      />

      <h3 v-if="currentPhase?.group" class="t-headline-2">{{ currentPhase.name }}</h3>
      <st-navigation
        :items="phaseNavigation"
        :name="$t('otherNavigation', { name: currentPhase?.name })"
        class="c-competition-edition__phase-navigation"
        small
      />

      <NuxtPage
        v-if="season && competitionEdition && currentPhase"
        :season="season"
        :competition-edition="competitionEdition"
        :phase="currentPhase"
      />
      <NuxtPage v-else-if="season" :season="season" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import CompetitionEdition from '~/models/competition-edition.model';
import type Phase from '~/models/phase.model';
import type Season from '~/models/season.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';
import {
  LeveradeGroupType,
  type Leverade,
  type LeveradeFaceoff,
  type LeveradeFacility,
  type LeveradeGroup,
  type LeveradeMatch,
  type LeveradeResult,
  type LeveradeRound,
  type LeveradeTeam,
} from '~/plugins/07.leverade';
import type { Await } from '~/types/types.utils';
import type Round from '~/models/round.model';
import type { DirectusMatchAdditionalData } from '~/plugins/06.directus';

const seasonsStore = useSeasonsStore();
const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
const getRouteBaseName = useRouteBaseName();
const { $cmsService, $leverade } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]',
    de: '/wettbewerbe/[competition]/[season]',
  },
});

const season = ref<Season | undefined>(seasonsStore.getSeasonBySlug(route.params.season as string));

const navigateToLastPhaseIfNoPhaseOrMatch = async (lastPhasePath: string | undefined) => {
  if (lastPhasePath && !route.params.matchId && (!route.params.phase || route.params.phase === 'last')) {
    await navigateTo(lastPhasePath);
  }
};

const {
  data: fetchedData,
  status: fetchStatus,
  error: fetchError,
  refresh,
} = useAsyncData<{
  rawCompetitionEdition: NationalCompetitionEdition;
  leveradeTournamentData: Await<ReturnType<Leverade['getFullTournament']>>;
  matchesAdditionalData: Record<string, DirectusMatchAdditionalData>;
  lastPhasePath: string | undefined;
}>(`competitionEdition-${route.params.season}-${route.params.competition}`, async () => {
  const rawCompetitionEditions = await $cmsService.getNationalCompetitionEditions({
    seasonSlug: route.params.season as string,
    competitionSlug: route.params.competition as string,
  });
  if (!rawCompetitionEditions || rawCompetitionEditions.length < 1) {
    throw new Error('No competition edition found');
  }
  // There should be only one edition matching the request parameters.
  if (rawCompetitionEditions.length > 1) {
    console.warn('Multiple competition editions matching the request. Taking the first one.');
  }

  if (!rawCompetitionEditions[0].leverade_id) {
    throw new Error('This competition edition has no Leverade ID');
  }
  const rawCompetitionEdition = rawCompetitionEditions[0];

  const leveradeTournamentData = await $leverade.getFullTournament(rawCompetitionEdition.leverade_id!);

  if (!leveradeTournamentData.included) {
    throw new Error('Related data is missing');
  }

  // Retrieve Directus data
  const matches = leveradeTournamentData.included.filter((entity) => entity.type === 'match') as LeveradeMatch[];
  const matchesAdditionalData = await $cmsService.getMatchesAdditionalData(matches.map((match) => match.id));

  // Sort phases and redirect to the last one if needed
  const phases = leveradeTournamentData.included.filter((entity) => entity.type === 'group') as LeveradeGroup[];
  phases.sort((phaseA, phaseB) => phaseA.attributes.order - phaseB.attributes.order);
  const lastPhase = phases[phases.length - 1];

  let lastPhasePath: string | undefined;
  try {
    if (!season.value?.leverade_id) {
      throw new Error('Season has no Leverade ID');
    }

    if (!lastPhase) {
      throw new Error('Competition edition does not have any phases');
    }

    let lastPhasePathName = 'competitions-competition-season-phase';
    const currentRouteName = getRouteBaseName(route);
    if (currentRouteName?.startsWith(lastPhasePathName)) {
      lastPhasePathName = currentRouteName;
    }

    lastPhasePath = localePath({
      name: lastPhasePathName,
      params: {
        competition: route.params.competition,
        season: route.params.season,
        phase: lastPhase.id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  navigateToLastPhaseIfNoPhaseOrMatch(lastPhasePath);

  return {
    rawCompetitionEdition,
    leveradeTournamentData,
    matchesAdditionalData,
    lastPhasePath,
  };
});

const competitionEdition = computed<CompetitionEdition | undefined>(() => {
  if (!fetchedData.value?.rawCompetitionEdition || !fetchedData.value?.leveradeTournamentData?.included) {
    return;
  }
  const competitionEdition = new CompetitionEdition(
    fetchedData.value?.rawCompetitionEdition,
    season.value || undefined,
  );

  const tournament = fetchedData.value?.leveradeTournamentData.data;
  const teams: LeveradeTeam[] = [];
  const groups: LeveradeGroup[] = [];
  const rounds: LeveradeRound[] = [];
  const faceoffs: LeveradeFaceoff[] = [];
  const matches: LeveradeMatch[] = [];
  const facilities: LeveradeFacility[] = [];
  const results: LeveradeResult[] = [];
  fetchedData.value?.leveradeTournamentData.included.forEach((entity) => {
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

  if (fetchedData.value?.matchesAdditionalData) {
    competitionEdition.addDirectusData(fetchedData.value.matchesAdditionalData);
  }

  return competitionEdition;
});

const phasesNavigation = computed<MenuItem[]>(() => {
  if (!competitionEdition.value?.phases) {
    return [];
  }

  const phases: MenuItem[] = [];

  competitionEdition.value.phases.forEach((phase) => {
    const phaseMenuItem = {
      name: phase.name,
      href: localePath({
        name: 'competitions-competition-season-phase',
        params: { competition: route.params.competition, season: route.params.season, phase: phase.id },
      }),
    };

    if (phase.group) {
      const existingGroupItem = phases.find((menuItem) => menuItem.name === phase.group);
      if (existingGroupItem) {
        if (existingGroupItem.children) {
          existingGroupItem.children.push(phaseMenuItem);
        } else {
          existingGroupItem.children = [phaseMenuItem];
        }
      } else {
        phases.push({
          name: phase.group,
          children: [phaseMenuItem],
        });
      }
    } else {
      phases.push(phaseMenuItem);
    }
  });

  return phases;
});

const currentPhase = computed<Phase | undefined>(() => {
  if (!route.params.phase || !competitionEdition.value?.phases) {
    return;
  }
  const phase = competitionEdition.value.phases.find((phase) => phase.id === route.params.phase);
  if (!phase) {
    // TODO: redirect to another phase instead of throwing an error.
    throw new Error('Unrecognised phase');
  }
  return phase;
});

const showPhasesNavigation = computed<boolean>(() => {
  return (
    !!currentPhase.value &&
    !!competitionEdition.value &&
    (phasesNavigation.value.length > 1 ||
      (phasesNavigation.value.length === 1 && phasesNavigation.value[0].name !== competitionEdition.value.name))
  );
});

const roundsToShow = computed<Round[]>(() => {
  return currentPhase.value?.rounds?.filter((round) => round.isPast || round.hasFinishedMatches) || [];
});

const phaseNavigation = computed<MenuItem[]>(() => {
  const params = { phase: route.params.phase };
  const phaseNavigation = [];

  // We show the standings only for the league mode (i.e. not in play-off mode)
  if (currentPhase.value?.type === LeveradeGroupType.LEAGUE) {
    phaseNavigation.push({
      name: t('competitions.phaseNavigation.standings').toString(),
      href: localePath({ name: 'competitions-competition-season-phase-standings', params }),
    });
  }

  if (roundsToShow.value.length > 0) {
    phaseNavigation.push({
      name: t('competitions.phaseNavigation.results').toString(),
      href: localePath({ name: 'competitions-competition-season-phase-results', params }),
    });
  }

  if (currentPhase.value && currentPhase.value.futureMatches.length > 0) {
    phaseNavigation.push({
      name: t('competitions.phaseNavigation.planning').toString(),
      href: localePath({ name: 'competitions-competition-season-phase-planning', params }),
    });
  }

  return phaseNavigation;
});

const breadcrumb = computed<BreadcrumbItem[]>(() => {
  const breadcrumb = [
    {
      pageName: 'seasons',
      displayName: t('season.name', 2),
    },
  ];

  if (season.value) {
    breadcrumb.push(
      ...[
        {
          displayName: season.value.name,
          pageName: 'seasons-season',
        },
      ],
    );
  }

  return breadcrumb;
});

watch(route, async (newRoute, oldRoute) => {
  if (
    newRoute.params.competition !== oldRoute.params.competition ||
    newRoute.params.season !== oldRoute.params.season
  ) {
    await refresh();
  }
  navigateToLastPhaseIfNoPhaseOrMatch(fetchedData.value?.lastPhasePath);
});
</script>

<style scoped>
.c-competition-edition__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-competition-edition__title a {
  color: initial;
}

.c-competition-edition__phases-navigation {
  margin-top: var(--st-length-spacing-xs);
}

.c-competition-edition__phase-navigation {
  margin-top: var(--st-length-spacing-s);
}
</style>
