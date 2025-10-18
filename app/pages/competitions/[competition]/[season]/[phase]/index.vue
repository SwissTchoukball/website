<template>
  <div>
    <!-- Because we read prop data, we still need a template -->
    <!-- TODO: Check if actually still needs this with Nuxt 3 -->
  </div>
</template>

<script setup lang="ts">
import type Phase from '~/models/phase.model';
import type Round from '~/models/round.model';

const localePath = useLocalePath();
const route = useRoute();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]',
    de: '/wettbewerbe/[competition]/[season]/[phase]',
  },
});

const props = defineProps({
  phase: {
    type: Object as PropType<Phase>,
    required: true,
  },
});

const roundsToShow = computed<Round[]>(() => {
  return props.phase?.rounds?.filter((round) => round.isPast || round.hasFinishedMatches) || [];
});

// Default redirect is to the standings
let redirectPath = localePath({
  name: 'competitions-competition-season-phase-standings',
  params: { phase: route.params.phase },
});

// If there are no results yet, and there are planned matches, we rather redirect to the planning
if (roundsToShow.value.length <= 0 && props.phase.futureMatches.length > 0) {
  redirectPath = localePath({
    name: 'competitions-competition-season-phase-planning',
  });
}

navigateTo(redirectPath);
</script>
