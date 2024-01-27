<template>
  <div>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="competition.live"></div>
    <st-national-team-competition-update-list
      :competition-id="competition.id"
      :teams="competition.teams"
      :live-refresh="isRunning"
      :telegram-channel-name="competition.telegram_channel"
      class="c-international-competition-live__updates"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { isWithinInterval } from 'date-fns';
import stNationalTeamCompetitionUpdateList from '~/components/national-teams/st-national-team-competition-update-list.vue';
import { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/competitions/:competition/live',
      de: '/nationalteams/wettbewerbe/:competition/live',
    },
  },
  components: { stNationalTeamCompetitionUpdateList },
  props: {
    competition: {
      type: Object as PropType<NationalTeamCompetition>,
      required: true,
    },
  },
  computed: {
    isRunning(): boolean {
      return (
        !!this.competition?.date_start &&
        !!this.competition.date_end &&
        isWithinInterval(new Date(), {
          start: new Date(this.competition.date_start),
          end: new Date(this.competition.date_end),
        })
      );
    },
  },
});
</script>

<style scoped>
.c-international-competition-live__updates {
  max-width: 45em;
  margin-top: var(--st-length-spacing-s);
}
</style>
