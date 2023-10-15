<template>
  <div>
    <!-- Because we use `fetch` (to read prop data), we still need a template -->
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';

export default Vue.extend({
  props: {
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  fetch() {
    // Default redirect is to the standings
    let redirectPath = this.localePath({
      name: 'competitions-competition-season-phase-standings',
      params: { phase: this.$route.params.phase },
    });

    // If there are no results yet, we rather redirect to the planning
    if (this.roundsToShow.length <= 0) {
      redirectPath = this.localePath({
        name: 'competitions-competition-season-phase-planning',
      });
    }

    if (process.server) {
      this.$nuxt.context.redirect(redirectPath);
    } else if (process.client) {
      this.$router.replace(redirectPath);
    }
  },
  computed: {
    roundsToShow(): Round[] {
      return this.phase.rounds.filter((round) => round.isPast || round.hasFinishedMatches);
    },
  },
});
</script>
