<template>
  <div>
    <h3 v-if="phase.group" class="t-headline-2">{{ phase.name }}</h3>
    <st-navigation
      :items="phaseNavigation"
      :name="$t('otherNavigation', { name: phase.name })"
      class="c-competition-phase__navigation"
      small
    />
    <NuxtPage v-if="phase" :season="season" :competition-edition="competitionEdition" :phase="phase" />
  </div>
</template>

<script setup lang="ts">
import type Season from '~/models/season.model';
import type Phase from '~/models/phase.model';
import type Round from '~/models/round.model';
import type CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType } from '~/plugins/07.leverade';

const localePath = useLocalePath();
const { t } = useI18n();
const route = useRoute();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]',
    de: '/wettbewerbe/[competition]/[season]/[phase]',
  },
});

const props = defineProps({
  season: {
    type: Object as PropType<Season>,
    required: true,
  },
  competitionEdition: {
    type: Object as PropType<CompetitionEdition>,
    required: true,
  },
  phase: {
    type: Object as PropType<Phase>,
    required: true,
  },
});

const roundsToShow = computed<Round[]>(() => {
  return props.phase?.rounds?.filter((round) => round.isPast || round.hasFinishedMatches) || [];
});

const phaseNavigation = computed<MenuItem[]>(() => {
  const params = { phase: route.params.phase };
  const phaseNavigation = [];

  // We show the standings only for the league mode (i.e. not in play-off mode)
  if (props.phase.type === LeveradeGroupType.LEAGUE) {
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

  if (props.phase.futureMatches.length > 0) {
    phaseNavigation.push({
      name: t('competitions.phaseNavigation.planning').toString(),
      href: localePath({ name: 'competitions-competition-season-phase-planning', params }),
    });
  }

  return phaseNavigation;
});
</script>

<style scoped>
.c-competition-phase__navigation {
  margin-top: var(--st-length-spacing-s);
}
</style>
