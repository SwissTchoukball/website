<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" main />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else>
      <p class="c-competition-edition__season">{{ seasonName }}</p>
      <h2 class="t-headline-1 c-competition-edition__title">{{ competition.attributes.name }}</h2>
      <st-navigation
        :items="phasesNavigation"
        :name="$t('otherNavigation', { name: `${competition.attributes.name}, ${seasonName}` })"
        class="c-competition-edition__phase-navigation"
        small
      />
      <nuxt-child :phases="phases" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { LeveradeGroup, LeveradeTournament } from '~/plugins/leverade';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season',
      de: '/wettbewerbe/:competition/:season',
    },
  },
  data() {
    return {
      seasonName: '',
      competition: undefined as LeveradeTournament | undefined,
      phases: [] as LeveradeGroup[],
    };
  },
  async fetch() {
    const competitionEdition = await this.$cmsService.getNationalCompetitionEdition(
      this.$route.params.competition,
      this.$route.params.season
    );
    if (!competitionEdition.leverade_id) {
      throw new Error('This competition edition has no Leverade ID');
    }
    this.seasonName = competitionEdition.season.name;
    const tournamentResponse = await this.$leverade.getTournament(competitionEdition.leverade_id);
    this.competition = tournamentResponse.data.data;
    const groupsResponse = await this.$leverade.getGroups(competitionEdition.leverade_id);
    this.phases = groupsResponse.data.data;

    // If no phase is selected, we redirect to the last one
    if (!this.$route.params.phase) {
      const lastPhasePath = this.localePath({
        name: 'competitions-competition-season-phase',
        params: {
          competition: this.$route.params.competition,
          season: this.$route.params.season,
          phase: this.phases[this.phases.length - 1].id,
        },
      });
      if (process.server) {
        this.$nuxt.context.redirect(lastPhasePath);
      } else if (process.client) {
        this.$router.replace(lastPhasePath);
      }
    }
  },
  computed: {
    phasesNavigation(): MenuItem[] {
      return this.phases.map((phase: any) => ({
        name: phase.attributes.name,
        href: this.localePath({
          name: 'competitions-competition-season-phase',
          params: { competition: this.$route.params.competition, season: this.$route.params.season, phase: phase.id },
        }),
      }));
    },
  },
});
</script>

<style scoped>
.c-competition-edition__season {
  padding-top: var(--st-length-spacing-xs);
  font-weight: 900;
  font-size: 0.8em;
}

.c-competition-edition__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-competition-edition__phase-navigation {
  padding-top: var(--st-length-spacing-xs);
}
</style>
