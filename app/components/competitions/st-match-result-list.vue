<template>
  <ul class="u-unstyled-list">
    <template v-for="match of matches">
      <li
        v-if="(match.home_team || match.away_team) && !match.canceled && !match.rest"
        :key="match.id"
        class="c-match-result-list__match"
      >
        <st-match-result :match="match" />
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import stMatchResult from '~/components/competitions/st-match-result.vue';
import type Match from '~/models/match.model';

defineProps({
  matches: {
    type: Array as PropType<Match[]>,
    required: true,
  },
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-match-result-list__match {
  border-bottom: 1px solid var(--st-color-match-results-separator);
  margin: 1rem 0;
}

.c-match-result-list__match:last-of-type {
  border-bottom: none;
}

@media (--sm-and-up) {
  .c-match-result-list__match {
    border-bottom: none;
  }
}
</style>
