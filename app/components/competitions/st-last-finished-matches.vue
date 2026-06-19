<template>
  <section v-if="fetchPending || fetchError || matchesData.length > 0" class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('competitions.lastResults') }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="matchesData.length > 0">
      <ul class="u-unstyled-list c-ongoing-matches__list">
        <template v-for="matchData of visibleMatchesData">
          <li v-if="matchData.match.homeTeamName && matchData.match.awayTeamName" :key="matchData.match.id">
            <st-match
              :match="matchData.match"
              :phase="matchData.phase"
              :round="matchData.round"
              show-phase
              show-round
              show-competition-edition
              hide-date
            />
          </li>
        </template>
      </ul>
      <st-link-action
        v-if="!areMoreResultsVisible"
        class="c-last-finished-matches__see-previous-trigger"
        @click="areMoreResultsVisible = true"
      >
        {{ $t('competitions.seePreviousResults') }}
      </st-link-action>
      <div v-else class="c-last-finished-matches__see-more-links">
        {{ $t('competitions.lastResultsOfCompetition') }}
        <st-link-action
          v-for="edition of competitionEditions"
          :key="edition.directus_id"
          with-arrow
          :to="getPathToEditionSchedule(edition)"
          class="c-last-finished-matches__see-more-link"
        >
          {{ edition.name }}
        </st-link-action>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
const { matchesData, competitionEditions, getPathToEditionSchedule, fetchPending, fetchError } =
  useMatches('lastFinished');

const areMoreResultsVisible = ref(false);
const matchesToShow = computed(() => (areMoreResultsVisible.value ? matchesData.value.length : 3));

const sortedMatchesData = computed(() => {
  // Placing the forfeited matches at the end of the list
  return matchesData.value.toSorted((a, b) => {
    if (a.match.home_team_score === 0 || a.match.away_team_score === 0) {
      return 1;
    }
    if (b.match.home_team_score === 0 || b.match.away_team_score === 0) {
      return -1;
    }
    return 0;
  });
});

const visibleMatchesData = computed(() => {
  return sortedMatchesData.value.slice(0, matchesToShow.value);
});
</script>

<style scoped>
.c-last-finished-matches__see-more-links {
  width: 100%;
  display: flex;
  justify-content: end;
  gap: var(--st-length-spacing-xs);
  flex-wrap: wrap;
  margin-top: var(--st-length-spacing-s);
}

.c-last-finished-matches__see-more-link {
  white-space: nowrap;
}

.c-last-finished-matches__see-previous-trigger {
  width: 100%;
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-s);
}
</style>
