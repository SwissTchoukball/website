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

<script lang="ts">
import Vue, { PropType } from 'vue';
import stMatchResult from '~/components/competitions/st-match-result.vue';
import Match from '~/models/match.model';

export default Vue.extend({
  components: {
    stMatchResult,
  },
  props: {
    matches: {
      type: Array as PropType<Match[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.c-match-result-list__match {
  border-bottom: 1px solid var(--st-color-match-results-separator);
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
