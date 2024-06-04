<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchPending" :main="true" />
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
        class="c-competition-edition__phase-navigation"
        small
        inverted
      />
      <NuxtPage
        v-if="season && competitionEdition && currentPhase"
        :season="season"
        :competition-edition="competitionEdition"
        :phase="currentPhase"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import CompetitionEdition from '~/models/competition-edition.model';
import type Phase from '~/models/phase.model';
import type Season from '~/models/season.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';
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
import type { Await } from '~/types/types.utils';

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

const season = ref<Season | undefined>();
const rawCompetitionEdition = ref<NationalCompetitionEdition | undefined>();
const leveradeTournamentData = ref<Await<ReturnType<Leverade['getFullTournament']>> | undefined>();
const lastPhasePath = ref<string | undefined>();

useAsyncData('season', async () => {
  season.value = seasonsStore.getSeasonBySlug(route.params.season as string);
});

const competitionEdition = computed<CompetitionEdition | undefined>(() => {
  if (!rawCompetitionEdition.value || !leveradeTournamentData.value?.included) {
    return;
  }
  const competitionEdition = new CompetitionEdition(rawCompetitionEdition.value, season.value);

  const tournament = leveradeTournamentData.value.data;
  const teams: LeveradeTeam[] = [];
  const groups: LeveradeGroup[] = [];
  const rounds: LeveradeRound[] = [];
  const faceoffs: LeveradeFaceoff[] = [];
  const matches: LeveradeMatch[] = [];
  const facilities: LeveradeFacility[] = [];
  const results: LeveradeResult[] = [];
  leveradeTournamentData.value.included.forEach((entity) => {
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

const fetchCompetitionEdition = async () => {
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
  rawCompetitionEdition.value = rawCompetitionEditions[0];

  leveradeTournamentData.value = await $leverade.getFullTournament(rawCompetitionEdition.value.leverade_id!);

  try {
    if (!season.value?.leverade_id) {
      throw new Error('Season has no Leverade ID');
    }

    if (!competitionEdition.value?.lastPhase) {
      throw new Error('Competition edition does not have any phases');
    }

    let lastPhasePathName = 'competitions-competition-season-phase';
    const currentRouteName = getRouteBaseName(route);
    if (currentRouteName?.startsWith(lastPhasePathName)) {
      lastPhasePathName = currentRouteName;
    }

    lastPhasePath.value = localePath({
      name: lastPhasePathName,
      params: {
        competition: route.params.competition,
        season: route.params.season,
        phase: competitionEdition.value?.lastPhase.id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  // If no phase or match is set, redirect to the last phase
  if (lastPhasePath.value && !route.params.matchId && (!route.params.phase || route.params.phase === 'last')) {
    console.log(lastPhasePath.value);
    navigateTo(lastPhasePath.value);
  }
};

const { pending: fetchPending, error: fetchError } = useAsyncData('competitionEdition', fetchCompetitionEdition);
watch(route, async (newRoute, oldRoute) => {
  if (
    newRoute.params.competition !== oldRoute.params.competition ||
    newRoute.params.season !== oldRoute.params.season
  ) {
    await fetchCompetitionEdition();
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

.c-competition-edition__phase-navigation {
  margin-top: var(--st-length-spacing-xs);
}
</style>
