<template>
  <section v-if="fetchPending || fetchError || matchesData.length > 0" class="l-main-content-section c-ongoing-matches">
    <h2 class="t-headline-1">{{ $t('competitions.ongoingMatches', matchesData.length) }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="matchesData.length > 0">
      <ul class="u-unstyled-list c-ongoing-matches__list">
        <template v-for="matchData of matchesData">
          <li
            v-if="matchData.match.homeTeamName && matchData.match.awayTeamName"
            :key="matchData.match.id"
            class="c-ongoing-matches__match"
          >
            <st-match
              :match="matchData.match"
              :phase="matchData.phase"
              :round="matchData.round"
              show-phase
              show-round
              hide-date
            />
          </li>
        </template>
      </ul>
    </template>
    <p v-else class="l-blank-slate-message">
      <!-- This will never be visible as we don't show the section when there are no matches. -->
      <!-- We still keep the blank slate in case we change our mind -->
      {{ $t('competitions.noOngoingMatches') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const { matchesData, fetchPending, fetchError } = useMatches('ongoing');
</script>
