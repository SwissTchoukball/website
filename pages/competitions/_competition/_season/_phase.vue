<template>
  <div>
    <st-navigation
      :items="phaseNavigation"
      :name="$t('otherNavigation', { name: phase.name })"
      class="c-competition-phase__navigation"
      small
    />
    <nuxt-child v-if="phase" :season="season" :competition-edition="competitionEdition" :phase="phase" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Season from '~/models/season.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType } from '~/plugins/leverade';
import { MenuItem } from '~/store/state';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase',
      de: '/wettbewerbe/:competition/:season/:phase',
    },
  },
  props: {
    season: {
      type: Object as PropType<Season>,
      required: true,
    },
    competitionEdition: {
      type: Object as PropType<CompetitionEdition>,
      required: true,
    },
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  computed: {
    roundsToShow(): Round[] {
      return this.phase?.rounds?.filter((round) => round.isPast || round.hasFinishedMatches) || [];
    },
    phaseNavigation(): MenuItem[] {
      const params = { phase: this.$route.params.phase };
      const phaseNavigation = [];

      // We show the standings only for the league mode (i.e. not in play-off mode)
      if (this.phase.type === LeveradeGroupType.LEAGUE) {
        phaseNavigation.push({
          name: this.$t('competitions.phaseNavigation.standings').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-standings', params }),
        });
      }

      if (this.roundsToShow.length > 0) {
        phaseNavigation.push({
          name: this.$t('competitions.phaseNavigation.results').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-results', params }),
        });
      }

      if (this.phase.futureMatches.length > 0) {
        phaseNavigation.push({
          name: this.$t('competitions.phaseNavigation.planning').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-planning', params }),
        });
      }

      return phaseNavigation;
    },
  },
});
</script>

<style scoped>
.c-competition-phase__navigation {
  margin-top: var(--st-length-spacing-s);
}
</style>
