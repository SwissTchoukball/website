<template>
  <div>
    <p v-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="!$fetchState.pending" class="directus-formatted-content" v-html="textEntry.body"></div>
    <st-national-team-competition-update-list
      v-if="competition"
      :competition-id="competition.id"
      :live-refresh="isRunning"
      class="c-international-competition-live__updates"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { isWithinInterval } from 'date-fns';
import stNationalTeamCompetitionUpdateList from '~/components/national-teams/st-national-team-competition-update-list.vue';
import { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';
import { TextEntry } from '~/plugins/cms-service';

export default Vue.extend({
  components: { stNationalTeamCompetitionUpdateList },
  props: {
    competition: {
      type: Object as PropType<NationalTeamCompetition>,
      required: true,
    },
  },
  data() {
    return {
      textEntry: undefined as TextEntry | undefined,
    };
  },
  async fetch() {
    this.textEntry = await this.$cmsService.getText(5);
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
