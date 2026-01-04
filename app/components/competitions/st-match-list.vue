<template>
  <ul v-if="matches.length > 0" class="u-unstyled-list">
    <template v-for="match of matches" :key="match.id">
      <li v-if="isMatchVisible(match)" class="c-match-list__match">
        <st-match :match="match" :phase="phase" :show-round="showRound" :show-phase="showPhase" />
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type Match from '~/models/match.model';
import type Phase from '~/models/phase.model';
import { LeveradeGroupType } from '~/plugins/07.leverade';

const {
  matches,
  phase = undefined,
  showRound,
  showPhase,
} = defineProps<{
  matches: Match[];
  phase?: Phase;
  showRound?: boolean;
  showPhase?: boolean;
}>();

const isMatchVisible = (match: Match): boolean => {
  return (
    (phase?.type === LeveradeGroupType.PLAY_OFF ||
      match.phase_type === LeveradeGroupType.PLAY_OFF ||
      !!match.home_team ||
      !!match.away_team) &&
    !match.rest
  );
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-match-list__match {
  margin-top: 1rem;
}
</style>
