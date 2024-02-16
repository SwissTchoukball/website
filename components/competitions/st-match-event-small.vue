<template>
  <st-event-small
    v-if="match.parsedDate"
    :start-date="match.parsedDate"
    :name="matchName"
    :details="details"
    :to="to"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Match from '~/models/match.model';
import stEventSmall from '~/components/events/st-event-small.vue';
import CompetitionEdition from '~/models/competition-edition.model';

export default defineComponent({
  components: { stEventSmall },
  props: {
    match: {
      type: Object as PropType<Match>,
      required: true,
    },
    competitionEdition: {
      type: Object as PropType<CompetitionEdition>,
      default: undefined,
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
          competition: this.competitionEdition?.competition.slug || '',
          season: this.competitionEdition?.season?.slug || '',
          matchId: this.match.id,
        },
      });
    },
    matchName(): string {
      return `${this.match.home_team?.name} - ${this.match.away_team?.name}`;
    },
  },
});
</script>
