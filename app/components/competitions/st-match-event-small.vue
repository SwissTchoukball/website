<template>
  <st-event-small
    v-if="match.parsedDate"
    :start-date="match.parsedDate"
    :name="matchName"
    :context="matchContext"
    :details="details"
    :to="to"
  />
</template>

<script setup lang="ts">
import type Match from '~/models/match.model';
import stEventSmall from '~/components/events/st-event-small.vue';
import type CompetitionEdition from '~/models/competition-edition.model';
import type Phase from '~/models/phase.model';
import type Round from '~/models/round.model';

const localePath = useLocalePath();

const props = defineProps({
  match: {
    type: Object as PropType<Match>,
    required: true,
  },
  competitionEdition: {
    type: Object as PropType<CompetitionEdition>,
    default: undefined,
  },
  phase: {
    type: Object as PropType<Phase>,
    default: undefined,
  },
  round: {
    type: Object as PropType<Round>,
    default: undefined,
  },
});

const details = computed<string>(() => {
  return props.match.facility ? `${props.match.facility.name}, ${props.match.facility.city}` : '';
});

const to = computed<string>(() => {
  return localePath({
    name: 'competitions-competition-season-match-matchId',
    params: {
      competition: props.competitionEdition?.competition.slug || '',
      season: props.competitionEdition?.season?.slug || '',
      matchId: props.match.id,
    },
  });
});

const matchName = computed<string>(() => {
  return `${props.match.homeTeamName} – ${props.match.awayTeamName}`;
});

const matchContext = computed<string>(() => {
  let context = '';
  if (props.competitionEdition?.name) {
    context += props.competitionEdition?.name;
  }

  if (props.round?.name) {
    if (context) {
      context += ' · ';
    }
    context += props.round.name;
  }

  return context;
});
</script>
