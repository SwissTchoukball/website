<template>
  <st-event-small
    v-if="match.parsedDate"
    :start-date="match.parsedDate"
    :name="matchName"
    :context="matchContext"
    :details="details"
    :is-full-day="hasNoTimeDefined"
    :to="match.pathToMatch || ''"
  />
</template>

<script setup lang="ts">
import type Match from '~/models/match.model';
import stEventSmall from '~/components/events/st-event-small.vue';

const props = defineProps({
  match: {
    type: Object as PropType<Match>,
    required: true,
  },
});

const details = computed<string>(() => {
  return props.match.facility ? `${props.match.facility.name}, ${props.match.facility.city}` : '';
});

const matchName = computed<string>(() => {
  return `${props.match.homeTeamName} – ${props.match.awayTeamName}`;
});

const matchContext = computed<string>(() => {
  let context = '';
  if (props.match.competition_edition_name) {
    context += props.match.competition_edition_name;
  }

  if (props.match.round_name) {
    if (context) {
      context += ' · ';
    }
    context += props.match.round_name;
  }

  return context;
});

const hasNoTimeDefined = computed<boolean>(() => {
  return (
    !props.match.parsedDate || (props.match.parsedDate.getHours() === 0 && props.match.parsedDate.getMinutes() === 0)
  );
});
</script>
