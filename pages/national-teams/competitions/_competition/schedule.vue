<template>
  <!-- We have to use v-html here as we get html content directly from Directus -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="directus-formatted-content" v-html="competition.schedule"></div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/competitions/:competition/programme',
      de: '/nationalteams/wettbewerbe/:competition/programm',
    },
  },
  props: {
    competition: {
      type: Object as PropType<NationalTeamCompetition>,
      required: true,
    },
  },
});
</script>
