<template>
  <div>
    <st-navigation
      :items="phaseNavigation"
      :name="$t('otherNavigation', { name: phase.attributes.name })"
      class="c-competition-phase__navigation"
      small
    />
    <nuxt-child />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { LeveradeGroup } from '~/plugins/leverade';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase',
      de: '/wettbewerbe/:competition/:season/:phase',
    },
  },
  props: {
    phases: {
      type: Array as PropType<LeveradeGroup[]>,
      required: true,
    },
  },
  computed: {
    phase(): LeveradeGroup {
      const phase = this.phases.find((phase) => phase.id === this.$route.params.phase);
      if (!phase) {
        throw new Error('Unrecognised phase');
      }
      return phase;
    },
    phaseNavigation(): MenuItem[] {
      const params = { phase: this.$route.params.phase };
      return [
        {
          name: this.$t('competitions.phaseNavigation.standings').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-standings', params }),
        },
        {
          name: this.$t('competitions.phaseNavigation.results').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-results', params }),
        },
        {
          name: this.$t('competitions.phaseNavigation.planning').toString(),
          href: this.localePath({ name: 'competitions-competition-season-phase-planning', params }),
        },
      ];
    },
  },
});
</script>

<style scoped>
.c-competition-phase__navigation {
  padding-top: var(--st-length-spacing-xs);
}
</style>
