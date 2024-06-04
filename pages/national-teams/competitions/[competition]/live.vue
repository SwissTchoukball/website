<template>
  <div>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="competition.live"></div>
    <client-only>
      <st-national-team-competition-update-list
        :competition-id="competition.id"
        :teams="competition.teams"
        :live-refresh="isRunning"
        :is-past="isCompetitionPast"
        :telegram-channel-name="competition.telegram_channel"
        class="c-international-competition-live__updates"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { isWithinInterval, isPast } from 'date-fns';
import type { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/competitions/[competition]/live',
    de: '/nationalteams/wettbewerbe/[competition]/live',
  },
});

const props = defineProps({
  competition: {
    type: Object as PropType<NationalTeamCompetition>,
    required: true,
  },
});

const isRunning = computed<boolean>(() => {
  return (
    !!props.competition?.date_start &&
    !!props.competition.date_end &&
    isWithinInterval(new Date(), {
      start: new Date(props.competition.date_start),
      end: new Date(props.competition.date_end),
    })
  );
});

const isCompetitionPast = computed<boolean>(() => {
  return !!props.competition?.date_end && isPast(new Date(props.competition.date_end));
});
</script>

<style scoped>
.c-international-competition-live__updates {
  max-width: 45em;
  margin-top: var(--st-length-spacing-s);
}
</style>
