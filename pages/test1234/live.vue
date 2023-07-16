<template>
  <div>
    <p>This is just a test page for the international competitions</p>
    <st-national-team-competition-update-list
      v-if="competition"
      :competition-id="competition.id"
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
  max-width: 800px;
  margin: auto;
  margin-top: var(--st-length-spacing-s);
}
</style>
