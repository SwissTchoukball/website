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
    </template>
    <!-- This parent div with an ID helps Vue to place the NuxtPage correctly
         and avoid the content from not rendering when navigating back -->
    <div id="competition-child-outlet">
      <!-- Keep a harmless placeholder when props aren’t ready -->
      <div v-if="Object.keys(childProps).length === 0" aria-hidden="true"></div>
      <NuxtPage v-else v-bind="childProps" />
    </div>
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
const routeBaseName = useRouteBaseName();
const { $cmsService, $leverade } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]',
    de: '/wettbewerbe/[competition]/[season]',
  },
});

const season = ref<Season | undefined>(seasonsStore.getSeasonBySlug(route.params.season as string));

const {
  data: rawCompetitionEdition,
  status: fetchStatus,
  error: fetchError,
} = useAsyncData<NationalCompetitionEdition>(
  () => `competitionEdition-${route.params.season}-${route.params.competition}`,
  async () => {
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
    return rawCompetitionEditions[0];
  },
);

const { data: leveradeTournamentData } = useAsyncData<Await<ReturnType<Leverade['getFullTournament']>>>(
  () =>
    `leveradeTournamentData-${route.params.season}-${route.params.competition}-${rawCompetitionEdition.value?.leverade_id}`,
  async () => {
    if (!rawCompetitionEdition.value) {
      throw new Error('No competition edition found');
    }

    return await $leverade.getFullTournament(rawCompetitionEdition.value.leverade_id!);
  },
);

const { data: matchesAdditionalData } = useAsyncData<Record<string, DirectusMatchAdditionalData>>(
  () =>
    `matchesAdditionalData-${route.params.season}-${route.params.competition}-${leveradeTournamentData.value?.data.id}`,
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

const { data: lastPhasePath } = useAsyncData<string>(
  () => `lastPhasePath-${route.params.competition}-${route.params.season}-${leveradeTournamentData.value?.data.id}`,
  async () => {
    if (!leveradeTournamentData.value) {
      throw new Error('No Leverade tournament data found');
    }

    if (!leveradeTournamentData.value.included) {
      throw new Error('Related data is missing');
    }
    // Sort phases and redirect to the last one if needed
    const phases = leveradeTournamentData.value.included.filter((entity) => entity.type === 'group') as LeveradeGroup[];
    phases.sort((phaseA, phaseB) => phaseA.attributes.order - phaseB.attributes.order);
    const lastPhase = phases[phases.length - 1];

    if (!season.value?.leverade_id) {
      throw new Error('Season has no Leverade ID');
    }

    if (!lastPhase) {
      throw new Error('Competition edition does not have any phases');
    }

    let lastPhasePathName = 'competitions-competition-season-phase';
    const currentRouteName = routeBaseName(route);
    if (typeof currentRouteName === 'string' && currentRouteName?.startsWith(lastPhasePathName)) {
      lastPhasePathName = currentRouteName;
    }

    return localePath({
      name: lastPhasePathName,
      params: {
        competition: route.params.competition,
        season: route.params.season,
        phase: lastPhase.id,
      },
    });
  },
);

const competitionEdition = computed<CompetitionEdition | undefined>(() => {
  if (!rawCompetitionEdition.value || !leveradeTournamentData.value?.included) {
    return;
  }
  const competitionEdition = new CompetitionEdition(rawCompetitionEdition.value, season.value || undefined);

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

const childProps = computed(() => {
  if (route.name?.toString().startsWith('competitions-competition-season-match-matchId')) {
    // Match page only needs season
    return season.value ? { season: season.value } : {};
  }
  // Results/planning/standings require all three
  if (season.value && competitionEdition.value && currentPhase.value) {
    return {
      season: season.value,
      competitionEdition: competitionEdition.value,
      phase: currentPhase.value,
    };
  }
  return {};
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

watch(lastPhasePath, (to) => {
  if (!to) return;
  // if on a match route, never auto-redirect
  if (route.params.matchId) return;

  // redirect only if we are truly on the “phase=last or missing”
  if (!route.params.phase || route.params.phase === 'last') {
    if (route.fullPath !== to) {
      navigateTo(lastPhasePath.value, { replace: true }); // replace avoids new history entry
    }
  }
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
