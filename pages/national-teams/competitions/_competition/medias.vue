<template>
  <div>
    <h3 class="t-headline-2">{{ $t('internationalCompetition.medias.title') }}</h3>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="competition.medias"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/competitions/:competition/medias',
      de: '/nationalteams/wettbewerbe/:competition/medien',
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
