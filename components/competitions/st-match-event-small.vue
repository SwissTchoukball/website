<template>
  <st-event-small
    :start-date="match.parsedDate()"
    :name="`${match.home_team.name} - ${match.away_team.name}`"
    :details="details"
    :to="to"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Match from '~/models/match.model';
import stEventSmall from '~/components/events/st-event-small.vue';

export default Vue.extend({
  components: { stEventSmall },
  props: {
    match: {
      type: Object as PropType<Match>,
      required: true,
    },
  },
  computed: {
    details(): string {
      return this.match.facility ? `${this.match.facility.name}, ${this.match.facility.city}` : '';
    },
    to(): string {
      return this.localePath({
        name: 'competitions-competition-season-match-matchId',
        params: {
          competition: this.match.round?.phase?.competition_edition?.competition?.slug,
          season: this.match.round?.phase?.competition_edition?.season?.slug,
          matchId: this.match.id,
        },
      });
    },
  },
});
</script>
