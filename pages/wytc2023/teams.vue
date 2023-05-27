<template>
  <div>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <st-national-team-competition-team-list v-else :teams="teams" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { NationalTeamForCompetition } from '~/components/national-teams/st-national-teams.prop';
import StNationalTeamCompetitionTeamList from '~/components/national-teams/st-national-team-competition-team-list.vue';

export default Vue.extend({
  components: { StNationalTeamCompetitionTeamList },
  nuxtI18n: {
    paths: {
      fr: '/wytc2023/equipes',
      de: '/wytc2023/teams',
    },
  },
  data() {
    return {
      teams: undefined as Omit<NationalTeamForCompetition, 'competition'>[] | undefined,
    };
  },
  async fetch() {
    this.teams = await this.$cmsService.getNationalTeamsForCompetition(25);
  },
});
</script>
