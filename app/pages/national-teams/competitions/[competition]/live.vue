<template>
  <div>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <section class="l-main-content-section">
      <div class="directus-formatted-content" v-html="competition.live"></div>
    </section>
    <section class="l-main-content-section c-international-competition-live__updates-section">
      <st-national-team-competition-update-list
        :competition-id="competition.id"
        :teams="competition.teams"
        :live-refresh="isRunning"
        :is-past="isCompetitionPast"
        :telegram-channel-name="competition.telegram_channel"
        class="c-international-competition-live__updates"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { addDays, isWithinInterval, isPast } from 'date-fns';
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
      // We add one day to the end date, as it takes the day at midnight.
      end: addDays(new Date(props.competition.date_end), 1),
    })
  );
});

const isCompetitionPast = computed<boolean>(() => {
  return !!props.competition?.date_end && isPast(new Date(props.competition.date_end));
});
</script>

<style scoped>
.c-international-competition-live__updates-section {
  margin-top: var(--st-length-spacing-s);
  padding-block: var(--st-length-spacing-s);
  background-color: var(--st-color-main-content-alternative-background);
}

.c-international-competition-live__updates {
  max-width: 70ch;
  margin-top: var(--st-length-spacing-s);
  margin-inline: auto;
}
</style>
