<template>
  <div>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-national-team-competition-team-list v-else-if="teams" :teams="teams" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  NationalTeamCompetition,
  NationalTeamForCompetition,
} from '~/components/national-teams/st-national-teams.prop';
import StNationalTeamCompetitionTeamList from '~/components/national-teams/st-national-team-competition-team-list.vue';

export default defineComponent({
  components: { StNationalTeamCompetitionTeamList },
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/competitions/:competition/equipes',
      de: '/nationalteams/wettbewerbe/:competition/teams',
    },
  },
  props: {
    competition: {
      type: Object as PropType<NationalTeamCompetition>,
      required: true,
    },
  },
  data() {
    return {
      teams: undefined as Omit<NationalTeamForCompetition, 'competition'>[] | undefined,
    };
  },
  async fetch() {
    this.teams = await this.$cmsService.getNationalTeamsForCompetition(this.competition.id);
    // We load the positions only if we don't have them already
    if (!this.$store.state.playerPositions) {
      await this.$store.dispatch('loadPlayerPositions');
    }
  },
});
</script>
