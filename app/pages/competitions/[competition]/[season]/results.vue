<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchStatus === 'pending'" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="competitionEdition">
      <st-phase-header
        :competition-edition="competitionEdition"
        :additional-breadcrumb-items="[
          {
            displayName: $t('competitions.results.title'),
          },
        ]"
      />
      <h3 class="t-headline-2">{{ $t('competitions.results.title') }}</h3>
      <st-match-list
        v-if="competitionEdition.lastFinishedMatches.length > 0"
        :matches="competitionEdition.lastFinishedMatches"
        show-round
        show-phase
      />
      <p v-else class="l-blank-slate-message">{{ $t('competitions.results.noResults') }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/resultats',
    de: '/wettbewerbe/[competition]/[season]/ergebnisse',
  },
});

const { competitionEdition, fetchStatus, fetchError } = useCompetitionEdition(
  route.params.season as string,
  route.params.competition as string,
);

useHead(() => {
  const title = t('competitions.headTitle.results', {
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
        content: t('competitions.description.results').toString(),
      },
    ],
  };
});
</script>
