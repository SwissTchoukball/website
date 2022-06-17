<template>
  <div>
    <st-navigation
      :items="phaseNavigation"
      :name="$t('otherNavigation', { name: phase.name })"
      class="c-competition-phase__navigation"
      small
    />
    <nuxt-child v-if="phase" :phase="phase" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Phase from '~/models/phase.model';
import { LeveradeGroupType } from '~/plugins/leverade';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase',
      de: '/wettbewerbe/:competition/:season/:phase',
    },
  },
  props: {
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  computed: {
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

      // TODO: Hide planning if no rounds planned in the future
      phaseNavigation.push(
        {
          name: this.$t('competitions.phaseNavigation.results').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-results', params }),
        },
        {
          name: this.$t('competitions.phaseNavigation.planning').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-planning', params }),
        }
      );

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
