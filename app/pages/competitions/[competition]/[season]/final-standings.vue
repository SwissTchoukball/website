<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchStatus === 'pending'" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="competitionEdition">
      <st-phase-header
        :competition-edition="competitionEdition"
        :additional-breadcrumb-items="[
          {
            displayName: $t('competitions.planning.title'),
          },
        ]"
      />
      <h3 class="t-headline-2">{{ $t('competitions.finalStandings.title') }}</h3>
      <div class="c-final-standings__table">
        <st-standings :rows="finalStandings" />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type Team from '~/models/team.model';

const { t } = useI18n();
const route = useRoute();

definePageMeta({
  scrollToTop: true,
});

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/classement-final',
    de: '/wettbewerbe/[competition]/[season]/endplatzierung',
  },
});

const { competitionEdition, fetchStatus, fetchError } = useCompetitionEdition(
  route.params.season as string,
  route.params.competition as string,
);

useHead(() => {
  const title = t('competitions.headTitle.planning', {
    editionName: competitionEdition.value?.name,
    seasonName: competitionEdition.value?.season?.name,
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.planning').toString(),
      },
    ],
  };
});

const finalStandings = computed<{ position: number; team: Team | undefined; columns: [] }[]>(() => {
  if (!competitionEdition.value?.final_standings || !competitionEdition.value.teams) {
    return [];
  }
  return competitionEdition.value.final_standings.map((standingRow, index) => {
    if (!competitionEdition.value?.teams) {
      return {
        position: index + 1,
        team: undefined,
        columns: [],
      };
    }
    return {
      position: index + 1,
      team: competitionEdition.value.teams.find((team) => Number(team.id) === standingRow.teamId),
      columns: [],
    };
  });
});
</script>

<style scoped>
.c-final-standings__table {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
