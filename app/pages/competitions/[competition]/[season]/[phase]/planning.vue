<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchStatus === 'pending'" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="phase && competitionEdition">
      <st-phase-header
        :competition-edition="competitionEdition"
        :phase="phase"
        :additional-breadcrumb-items="[
          {
            displayName: $t('competitions.planning.title'),
          },
        ]"
      />
      <h4 class="t-headline-3">{{ $t('competitions.planning.title') }}</h4>
      <st-match-list v-if="phase.futureMatches.length > 0" :matches="phase.futureMatches" :phase="phase" show-round />
      <p v-else class="l-blank-slate-message">{{ $t('competitions.planning.noMatches') }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

definePageMeta({
  scrollToTop: true,
});

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]/programme',
    de: '/wettbewerbe/[competition]/[season]/[phase]/programm',
  },
});

const { competitionEdition, phase, fetchStatus, fetchError } = useCompetitionPhase(
  route.params.season as string,
  route.params.competition as string,
  route.params.phase as string,
);

useHead(() => {
  const title = t('competitions.headTitle.phasePlanning', {
    phaseName: phase.value?.name,
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
</script>
