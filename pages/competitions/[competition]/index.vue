<template>
  <div></div>
</template>

<script setup lang="ts">
import Competition from '~/models/competition.model';

const route = useRoute();
const localePath = useLocalePath();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]',
    de: '/wettbewerbe/[competition]',
  },
});

const loadCompetition = async () => {
  const competition = await $cmsService.getNationalCompetition(route.params.competition as string);
  const nationalCompetition = new Competition(competition);

  if (!nationalCompetition.lastEdition) {
    throw new Error('Competition has no editions');
  }

  if (typeof nationalCompetition.lastEdition.season === 'number') {
    throw new TypeError('Season of last edition is not populated');
  }

  // TODO: Also retrieve the phase data to directly redirect at the correct page
  //       instead of doing redirect over redirect.
  //       This would require caching of phases to avoid fetching them twice.

  navigateTo(
    localePath({
      name: 'competitions-competition-season',
      params: {
        competition: route.params.competition,
        season: nationalCompetition.lastEdition.season.slug,
      },
    }),
  );
};

loadCompetition();
</script>
