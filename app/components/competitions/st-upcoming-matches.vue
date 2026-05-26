<template>
  <section
    v-if="fetchPending || fetchError || matchesData.length > 0"
    class="l-main-content-section c-upcoming-matches"
  >
    <h2 class="t-headline-1">{{ $t('competitions.upcomingMatches') }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="matchesData.length > 0">
      <ul class="u-unstyled-list c-upcoming-matches__list">
        <template v-for="matchData of matchesData">
          <li
            v-if="matchData.match.homeTeamName && matchData.match.awayTeamName"
            :key="matchData.match.id"
            class="c-upcoming-matches__match"
          >
            <st-match-event-small :match="matchData.match" />
          </li>
        </template>
      </ul>
      <div class="c-upcoming-matches__see-more-links">
        {{ $t('competitions.upcomingMatchesOfCompetition') }}
        <st-link-action
          v-for="edition of competitionEditions"
          :key="edition.directus_id"
          with-arrow
          :to="getPathToEditionSchedule(edition)"
          class="c-upcoming-matches__see-more-link"
        >
          {{ edition.name }}
        </st-link-action>
      </div>
    </template>
    <p v-else class="l-blank-slate-message">
      <!-- This will never be visible as we don't show the section when there are no matches. -->
      <!-- We still keep the blank slate in case we change our mind -->
      {{ $t('competitions.noUpcomingMatches') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const { matchesData, competitionEditions, getPathToEditionSchedule, fetchPending, fetchError } = useMatches('upcoming');
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-upcoming-matches__list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.c-upcoming-matches__match {
  margin-top: var(--st-length-spacing-xs);
  padding-right: var(--st-length-spacing-xs);
  width: 100%;
}

.c-upcoming-matches__see-more-links {
  display: flex;
  justify-content: end;
  gap: var(--st-length-spacing-xs);
  flex-wrap: wrap;
  margin-top: var(--st-length-spacing-s);
}

.c-upcoming-matches__see-more-link {
  white-space: nowrap;
}

@media (--sm-and-up) {
  .c-upcoming-matches__list {
    flex-wrap: wrap;
    max-height: 13em;
  }

  .c-upcoming-matches__match {
    width: 50%;
  }
}

@media (--lg-and-up) {
  .c-upcoming-matches__match {
    width: calc(100% / 3);
  }
}
</style>
