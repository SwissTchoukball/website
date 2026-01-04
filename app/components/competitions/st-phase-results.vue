<template>
  <st-link-action
    v-if="!areAllMatchesFinished && !showNotFinishedMatches"
    class="c-results__finished-matches-toggle"
    @click="showNotFinishedMatches = true"
  >
    {{ $t('competitions.results.showNotFinishedMatches') }}
  </st-link-action>
  <st-link-action
    v-else-if="!areAllMatchesFinished"
    class="c-results__finished-matches-toggle"
    @click="showNotFinishedMatches = false"
  >
    {{ $t('competitions.results.hideNotFinishedMatches') }}
  </st-link-action>

  <ul v-if="phase.rounds" class="u-unstyled-list c-results__round">
    <li
      v-for="round of phase.rounds.toSorted((roundA, roundB) => roundB.order - roundA.order)"
      :key="round.id"
      class="c-results__round"
    >
      <template v-if="!round.faceoffs || !round.faceoffs.length">
        <h3 class="t-headline-2 c-results__round-name">{{ round.name }}</h3>
        <st-match-list :matches="visibleMatchesOfRound(round)" :phase="phase" />
      </template>

      <template v-else>
        <div v-for="(faceoff, index) of round.faceoffs" :key="faceoff.id">
          <template v-if="faceoffHasMatches(faceoff)">
            <h3 class="c-results__round-name" :class="round.faceoffs.length > 1 ? 't-headline-3' : 't-headline-2'">
              {{ round.name }}
              <template v-if="round.faceoffs.length > 1">{{ index + 1 }}</template>
            </h3>

            <div v-if="isFaceoffAutoQualified(faceoff) && faceoff.winner">
              {{ $t('competitions.results.autoQualified', { teamName: getFaceoffWinnerName(faceoff) }) }}
            </div>
            <st-match-list v-else :matches="visibleMatchesOfFaceoff(faceoff)" :phase="phase" />
          </template>
        </div>
      </template>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import type Faceoff from '~/models/faceoff.model';
import type Match from '~/models/match.model';
import type Phase from '~/models/phase.model';
import type Round from '~/models/round.model';

const { phase } = defineProps<{
  phase: Phase;
}>();

const showNotFinishedMatches = ref(false);

const areAllMatchesFinished = computed<boolean>(() => {
  return (
    !phase.rounds ||
    phase.rounds?.every(
      (round) =>
        (!round.matches ||
          round.matches
            ?.filter((match) => match.homeTeamName || match.awayTeamName)
            .every((match) => match.finished || match.rest || match.canceled)) &&
        (!round.faceoffs ||
          round.faceoffs.every(
            (faceoff) =>
              !faceoff.matches ||
              faceoff.matches
                ?.filter((match) => match.homeTeamName || match.awayTeamName)
                .every((match) => match.finished || match.rest || match.canceled),
          )),
    )
  );
});

const isFaceoffAutoQualified = (faceoff: Faceoff): boolean => {
  if (!faceoff.matches?.length || !faceoff.matches[0]) {
    return false;
  }
  // We check this based on the first match only
  const firstMatch = faceoff.matches[0];
  return (!firstMatch.home_team || !firstMatch.away_team) && firstMatch.finished && !!faceoff.winner;
};

/**
 * Checks that a faceoff has a match with a least one team set.
 */
const faceoffHasMatches = (faceoff: Faceoff): boolean => {
  if (!faceoff.matches || !faceoff.matches[0]) {
    return false;
  }
  // We check this based on the first match only
  const firstMatch = faceoff.matches[0];
  return !!(firstMatch.homeTeamName || firstMatch.awayTeamName);
};

const getFaceoffWinnerName = (faceoff: Faceoff): string => {
  return faceoff.winner ? faceoff[`${faceoff.winner}_team`]?.name || '' : '';
};

const visibleMatchesOfRound = (round: Round): Match[] => {
  return round.matches?.filter((match) => showNotFinishedMatches.value || match.finished) || [];
};

const visibleMatchesOfFaceoff = (faceoff: Faceoff): Match[] => {
  return faceoff.matches?.filter((match) => showNotFinishedMatches.value || match.finished) || [];
};
</script>

<style>
.c-results__finished-matches-toggle {
  display: block;
  margin-top: var(--st-length-spacing-s);
}

.c-results__round {
  margin-bottom: var(--st-length-spacing-m);
}

.c-results__round-name {
  text-align: center;
}

/* If it is the only element in the <li>, it means there are no visible matches in this round */
.c-results__round-name:last-child {
  display: none;
}
</style>
