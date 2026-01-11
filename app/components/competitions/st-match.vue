<template>
  <nuxt-link
    class="c-match"
    :class="{ 'c-match--has-score': match.hasScore, 'c-match--play-off': isPlayOff }"
    :to="localePath({ name: 'competitions-competition-season-match-matchId', params: { matchId: match.id } })"
  >
    <st-event-date v-if="match.parsedDate" :start-date="match.parsedDate" always-one-line />

    <div class="c-match__phase-and-round">
      <template v-if="showPhase">{{ phaseName }}</template>
      <template v-if="showPhase && showRoundComputed"> · </template>
      <template v-if="showRoundComputed">{{ roundName }}</template>
    </div>

    <div v-if="match.homeTeamName || match.awayTeamName" class="c-match__teams">
      <div class="c-match__team-name" :class="{ 'c-match__team-name--winner': match.hasHomeTeamWon }">
        {{ match.homeTeamName }}
      </div>
      <img
        v-if="match.home_team && match.home_team.avatarMediumUrl"
        :src="match.home_team.avatarMediumUrl"
        class="c-match__team-avatar"
      />
      <div v-if="match.hasScore" class="c-match__team-score">{{ match.home_team_score }}</div>
      <div class="c-match__cross">&#9587;</div>
      <div class="c-match__score-separator">-</div>
      <div v-if="match.hasScore" class="c-match__team-score">{{ match.away_team_score }}</div>
      <img
        v-if="match.away_team && match.away_team.avatarMediumUrl"
        :src="match.away_team.avatarMediumUrl"
        class="c-match__team-avatar"
      />
      <div class="c-match__team-name" :class="{ 'c-match__team-name--winner': match.hasAwayTeamWon }">
        {{ match.awayTeamName }}
      </div>
    </div>

    <div v-if="!match.finished && !match.canceled" class="c-match__details">
      <st-cancelled-label v-if="match.canceled" class="c-match__cancelled" />
      <template v-else>
        <template v-if="showTime">
          <font-awesome-icon icon="clock" class="c-match__icon" />
          {{ match.parsedDate ? $formatDate(match.parsedDate, 'HH:mm') : '' }}
        </template>
        <template v-if="match.facility">
          <font-awesome-icon icon="location-dot" class="c-match__icon" />
          {{ match.facility.name }}, {{ match.facility.city }}
        </template>
      </template>
    </div>

    <div class="c-match__additional-info">
      <st-chip v-if="match.youtube_video_id">{{ $t(match.finished ? 'match.video' : 'match.live') }}</st-chip>
      <st-chip v-if="match.flickr_photoset_id">{{ $t('match.photos') }}</st-chip>
    </div>
  </nuxt-link>
</template>

<script lang="ts" setup>
import type Match from '~/models/match.model';
import type Phase from '~/models/phase.model';
import { LeveradeGroupType } from '~/plugins/07.leverade';

const { $formatDate } = useNuxtApp();
const localePath = useLocalePath();

const {
  match,
  phase = undefined,
  showRound,
} = defineProps<{
  match: Match;
  phase?: Phase;
  showPhase?: boolean;
  showRound?: boolean;
}>();

const showTime = computed<boolean>(() => {
  // This can be a problem if a match is actually scheduled at midnight.
  // Unfortunately, there's currently no way to differentiate a match for which the date is not set from one where it is scheduled at midnight.
  return !!(match.parsedDate && $formatDate(match.parsedDate, 'HH:mm') !== '00:00');
});

const isPlayOff = computed<boolean>(() => {
  return phase ? phase?.type === LeveradeGroupType.PLAY_OFF : match.phase_type === LeveradeGroupType.PLAY_OFF;
});

const showRoundComputed = computed<boolean>(() => {
  if (typeof showRound === 'boolean') {
    return showRound;
  }
  return isPlayOff.value;
});

const phaseName = computed<string>(() => {
  return match.phase_name || phase?.name || '';
});

const roundName = computed<string>(() => {
  return match.round_name || phase?.rounds?.find((round) => round.id === match.round_id)?.name || '';
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-match {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--st-length-spacing-xs);
  position: relative;
  margin-top: var(--st-length-spacing-s);
  width: 100%;
  color: inherit;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.2s ease-in;
}

.c-match:hover {
  box-shadow: rgb(149 157 165 / 20%) 0 8px 24px;
  transform: translateY(-2px);
}

.c-match__main {
  flex-grow: 2;
}

.c-match__phase-and-round {
  color: var(--st-color-match-phase-round);
  font-size: 0.7em;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: var(--st-length-spacing-xxs);

  .c-match--play-off & {
    color: var(--st-color-match-phase-round-play-off);
  }
}

.c-match__teams {
  display: grid;
  grid-template-columns: 1fr min-content 1fr;
  grid-template-areas:
    'home-team-avatar cross away-team-avatar'
    'home-team-name cross away-team-name';
  align-items: center;
  gap: var(--st-length-spacing-xxs);
  font-size: 1rem;
  width: 100%;
  margin-top: var(--st-length-spacing-xxs);

  @media (--sm-and-up) {
    grid-template-columns: 1fr min-content min-content min-content 1fr;
    grid-template-areas: 'home-team-name home-team-avatar cross away-team-avatar away-team-name';
    gap: var(--st-length-spacing-xs);
    font-size: 1.2rem;
  }

  .c-match--has-score & {
    grid-template-columns: 1fr min-content min-content min-content 1fr;
    grid-template-areas:
      'home-team-avatar home-team-score score-separator away-team-score away-team-avatar'
      'home-team-name home-team-name cross away-team-name away-team-name';

    @media (--sm-and-up) {
      grid-template-columns: 1fr min-content min-content min-content min-content min-content 1fr;
      grid-template-areas: 'home-team-name home-team-avatar home-team-score score-separator away-team-score away-team-avatar away-team-name';
    }
  }
}

.c-match__cross {
  grid-area: cross;

  @media (--sm-and-up) {
    .c-match--has-score & {
      display: none;
    }
  }
}

.c-match__team-avatar {
  width: 50px;
  height: 50px;
}

.c-match__team-score {
  padding: 0;
  color: var(--st-color-match-score);
  font-weight: bold;
  width: 2em;
}

.c-match__score-separator {
  grid-area: score-separator;
  color: var(--st-color-match-score);
  font-weight: bold;
  text-align: center;

  .c-match:not(.c-match--has-score) & {
    display: none;
  }
}

.c-match__team-name {
  .c-match--has-score &.c-match__team-name--winner {
    font-weight: bold;
  }
}

.c-match__team-name:nth-child(1 of .c-match__team-name) {
  grid-area: home-team-name;
  text-align: right;
}

.c-match__team-name:nth-child(2 of .c-match__team-name) {
  grid-area: away-team-name;
}

.c-match__team-avatar:nth-child(1 of .c-match__team-avatar) {
  grid-area: home-team-avatar;
  justify-self: end;
}

.c-match__team-avatar:nth-child(2 of .c-match__team-avatar) {
  grid-area: away-team-avatar;
}

.c-match__team-score:nth-child(1 of .c-match__team-score) {
  grid-area: home-team-score;
  text-align: right;
}

.c-match__team-score:nth-child(2 of .c-match__team-score) {
  grid-area: away-team-score;
  text-align: left;
}

.c-match__details {
  margin-top: var(--st-length-spacing-xs);
}

.c-match__icon {
  color: var(--st-color-event-icon);
}

.c-match__icon:not(:first-child) {
  margin-left: var(--st-length-spacing-xs);
}

.c-match__additional-info {
  margin-top: var(--st-length-spacing-xs);
  display: flex;
  gap: var(--st-length-spacing-xxs);
}
</style>
