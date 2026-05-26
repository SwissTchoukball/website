<template>
  <div>
    <section class="l-main-content-section">
      <st-loader v-if="fetchStatus === 'pending'" :main="true" />
      <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    </section>
    <template v-if="phase && competitionEdition">
      <div class="c-phase__header">
        <st-phase-header :competition-edition="competitionEdition" :phase="phase" />
      </div>

      <section class="l-main-content-section">
        <div class="c-phase__anchor-links">
          <st-link-action v-if="isLeague && phase.futureMatches.length > 0" to="#future-matches" with-arrow>
            {{ $t('competitions.planning.title') }}
          </st-link-action>

          <st-link-action
            v-if="(isLeague || phase.futureMatches.length > 0) && phase.rounds && phase.lastFinishedMatches.length > 0"
            to="#last-results"
            with-arrow
          >
            {{ $t('competitions.results.lastResults') }}
          </st-link-action>
        </div>

        <template v-if="isLeague">
          <h4 class="t-headline-3">{{ $t('competitions.standings.title') }}</h4>
          <st-phase-standings
            v-if="competitionEdition?.season && phase"
            :season="competitionEdition.season"
            :competition-edition="competitionEdition"
            :phase="phase"
            class="c-phase__standings"
          />
        </template>
      </section>

      <section v-if="phase.futureMatches.length > 0" class="l-main-content-section c-phase__section">
        <h4 id="future-matches" class="t-headline-3">{{ $t('competitions.planning.title') }}</h4>
        <st-match-list :matches="phase.futureMatches.slice(0, MAX_FUTURE_MATCHES_TO_SHOW)" :phase="phase" show-round />
        <st-link-action
          :to="localePath('competitions-competition-season-phase-planning')"
          with-arrow
          class="c-phase__link-action"
        >
          {{ $t('competitions.planning.seeAllUpcomingMatches') }}
        </st-link-action>
      </section>

      <section
        v-if="phase.rounds && phase.lastFinishedMatches.length > 0"
        class="l-main-content-section c-phase__section"
      >
        <h4 id="last-results" class="t-headline-3">
          {{
            $t(
              phase.lastFinishedMatches.length > MAX_RESULTS_TO_SHOW
                ? 'competitions.results.lastResults'
                : 'competitions.results.title',
            )
          }}
        </h4>
        <st-match-list :matches="phase.lastFinishedMatches.slice(0, MAX_RESULTS_TO_SHOW)" :phase="phase" show-round />
        <st-link-action
          v-if="phase.lastFinishedMatches.length > MAX_RESULTS_TO_SHOW"
          :to="localePath('competitions-competition-season-phase-results')"
          with-arrow
          class="c-phase__link-action"
        >
          {{ $t('competitions.results.seeAllResults') }}
        </st-link-action>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { LeveradeGroupType } from '~/plugins/07.leverade';

const localePath = useLocalePath();
const route = useRoute();
const { t } = useI18n();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]',
    de: '/wettbewerbe/[competition]/[season]/[phase]',
  },
});

const MAX_FUTURE_MATCHES_TO_SHOW = 5;
const MAX_RESULTS_TO_SHOW = 5;

const { competitionEdition, season, phase, fetchStatus, fetchError } = useCompetitionPhase(
  route.params.season as string,
  route.params.competition as string,
  route.params.phase as string,
);

const isLeague = computed<boolean>(() => {
  return phase.value?.type === LeveradeGroupType.LEAGUE;
});

useHead(() => {
  const title = t('competitions.headTitle.phase', {
    phaseName: phase.value?.name,
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
        content: t(
          isLeague.value
            ? 'competitions.description.standingsWithUpcomingGamesAndLastResults'
            : 'competitions.description.upcomingGamesAndLastResults',
        ).toString(),
      },
    ],
  };
});

watch(
  () => phase.value,
  (newPhase) => {
    if (newPhase && newPhase.futureMatches.length === 0 && !isLeague.value) {
      navigateTo(
        localePath({
          name: 'competitions-competition-season-phase-results',
          params: {
            competition: route.params.competition,
            season: route.params.season,
            phase: newPhase.id,
          },
        }),
      );
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.c-phase__header {
  padding-inline: var(--st-length-main-content-side-padding);
}

.c-phase__section {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-phase__standings {
  padding-bottom: var(--st-length-spacing-s);
}

.c-phase__anchor-links {
  display: flex;
  gap: var(--st-length-spacing-xs);
  margin-top: var(--st-length-spacing-xs);
  font-size: 0.8rem;
}

.c-phase__link-action {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-s);
}
</style>
