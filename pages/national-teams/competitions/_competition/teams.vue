<template>
  <div>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-national-team-competition-team-list v-else :teams="teams" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  NationalTeamCompetition,
  NationalTeamForCompetition,
} from '~/components/national-teams/st-national-teams.prop';
import StNationalTeamCompetitionTeamList from '~/components/national-teams/st-national-team-competition-team-list.vue';

export default Vue.extend({
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
  },
});
</script>
