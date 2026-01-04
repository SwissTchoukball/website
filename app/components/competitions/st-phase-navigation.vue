<template>
  <st-navigation
    v-if="showPhasesNavigation && competitionEdition && competitionEdition.season"
    :items="phasesNavigation"
    :name="$t('otherNavigation', { name: `${competitionEdition.name}, ${competitionEdition.season?.name}` })"
    small
    inverted
  />
</template>

<script setup lang="ts">
import type CompetitionEdition from '~/models/competition-edition.model';

const localePath = useLocalePath();

const { competitionEdition } = defineProps<{
  competitionEdition: CompetitionEdition;
}>();

const showPhasesNavigation = computed<boolean>(() => {
  return (
    !!competitionEdition &&
    (phasesNavigation.value.length > 1 ||
      (phasesNavigation.value.length === 1 && phasesNavigation.value[0]?.name !== competitionEdition.name))
  );
});

const phasesNavigation = computed<MenuItem[]>(() => {
  if (!competitionEdition?.phases) {
    return [];
  }

  const phases: MenuItem[] = [];

  competitionEdition.phases.forEach((phase) => {
    const phaseMenuItem = {
      name: phase.name,
      href: localePath({
        name: 'competitions-competition-season-phase',
        // params: { competition: route.params.competition, season: route.params.season, phase: phase.id },
        params: {
          competition: competitionEdition.competition.slug,
          season: competitionEdition.season?.slug,
          phase: phase.id,
        },
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
</script>
