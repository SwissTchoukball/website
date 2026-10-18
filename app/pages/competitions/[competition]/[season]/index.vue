<template>
  <div>
    <section class="l-main-content-section">
      <st-loader v-if="fetchStatus === 'pending'" :main="true" />
      <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    </section>
    <template v-if="competitionEdition">
      <div class="c-competition-edition__header">
        <st-phase-header :competition-edition="competitionEdition" />
      </div>

      <section v-if="finalStandings.length" class="l-main-content-section">
        <h4 class="t-headline-3">{{ $t('competitions.finalStandings.title') }}</h4>
        <div class="c-competition-edition__final-standings">
          <st-standings :rows="finalStandings" />
        </div>
      </section>

      <section
        v-if="competitionEdition.futureMatches.length > 0"
        class="l-main-content-section c-competition-edition__section"
      >
        <h4 class="t-headline-3">{{ $t('competitions.planning.title') }}</h4>
        <st-match-list
          :matches="competitionEdition.futureMatches.slice(0, MAX_FUTURE_MATCHES_TO_SHOW)"
          show-round
          show-phase
        />
        <st-link-action
          :to="localePath('competitions-competition-season-planning')"
          with-arrow
          class="c-competition-edition__link-action"
        >
          {{ $t('competitions.planning.seeAllUpcomingMatches') }}
        </st-link-action>
      </section>

      <section
        v-if="competitionEdition.lastFinishedMatches.length > 0"
        class="l-main-content-section c-competition-edition__section"
      >
        <h4 class="t-headline-3">{{ $t('competitions.results.lastResults') }}</h4>
        <st-match-list
          :matches="competitionEdition.lastFinishedMatches.slice(0, MAX_RESULTS_TO_SHOW)"
          show-round
          show-phase
        />
        <st-link-action
          v-if="competitionEdition.lastFinishedMatches.length > MAX_RESULTS_TO_SHOW"
          :to="localePath('competitions-competition-season-results')"
          with-arrow
          class="c-competition-edition__link-action"
        >
          {{ $t('competitions.results.seeAllResults') }}
        </st-link-action>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type Team from '~/models/team.model';

const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]',
    de: '/wettbewerbe/[competition]/[season]',
  },
});

const MAX_FUTURE_MATCHES_TO_SHOW = 5;
const MAX_RESULTS_TO_SHOW = 5;

const { competitionEdition, season, fetchStatus, fetchError } = useCompetitionEdition(
  route.params.season as string,
  route.params.competition as string,
);

useHead(() => {
  const title = t('competitions.headTitle.competitionEdition', {
    editionName: competitionEdition.value?.name,
    seasonName: season.value?.name,
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.upcomingGamesAndLastResults').toString(),
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

watch(
  () => competitionEdition.value?.phases,
  (newPhases) => {
    if (newPhases?.length === 1) {
      navigateTo(
        localePath({
          name: 'competitions-competition-season-phase',
          params: {
            competition: route.params.competition,
            season: route.params.season,
            phase: newPhases[0]!.id,
          },
        }),
      );
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.c-competition-edition__header {
  padding-inline: var(--st-length-main-content-side-padding);
}

.c-competition-edition__section {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-competition-edition__final-standings {
  width: 100%;
  display: flex;
  justify-content: center;
}

.c-competition-edition__link-action {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-s);
}
</style>
