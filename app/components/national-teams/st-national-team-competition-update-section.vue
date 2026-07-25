<template>
  <section class="l-main-content-section">
    <!-- TODO: Make it more competition-agnostic -->
    <h2 class="t-headline-1">Euro 2026 – {{ $t('internationalCompetition.live.updates.title') }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="!fetchPending && competition">
      <st-national-team-competition-update-list
        :competition-id="competition.id"
        :teams="competition.teams"
        :live-refresh="isRunning"
        :is-past="isCompetitionPast"
        :telegram-channel-name="competition.telegram_channel"
        :updates-per-page="3"
        hide-header
        hide-filters
        hide-pagination
        class="c-national-team-competition-update-section__updates"
      />
    </template>

    <st-link-action
      :to="localePath({ name: 'national-teams-competitions-competition-live', params: { competition: 'euro2026' } })"
      class="c-national-team-competition-update-section__read-more-updates"
      with-arrow
    >
      {{ $t('internationalCompetition.live.updates.seePreviousUpdates') }}
    </st-link-action>
  </section>
</template>

<script setup lang="ts">
import { addDays, isWithinInterval, isPast } from 'date-fns';
import type { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';

const route = useRoute();
const { locale } = useI18n();
const localePath = useLocalePath();
const { $cmsService } = useNuxtApp();

const {
  data: competition,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<NationalTeamCompetition>(
  `competition-${route.params.competition as string}-${locale.value}`,
  async () => {
    // TODO: Make that configurable from Directus
    return await $cmsService.getNationalTeamCompetition({ slug: 'euro2026' });
  },
);

const isRunning = computed<boolean>(() => {
  return (
    !!competition.value?.date_start &&
    !!competition.value.date_end &&
    isWithinInterval(new Date(), {
      start: new Date(competition.value.date_start),
      // We add one day to the end date, as it takes the day at midnight.
      end: addDays(new Date(competition.value.date_end), 1),
    })
  );
});

const isCompetitionPast = computed<boolean>(() => {
  return !!competition.value?.date_end && isPast(new Date(competition.value.date_end));
});
</script>

<style scoped>
.c-national-team-competition-update-section__updates {
  max-width: 70ch;
  margin-inline: auto;
}

.c-national-team-competition-update-section__read-more-updates {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-s);
  width: 100%;
}
</style>
