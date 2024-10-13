<template>
  <nuxt-link
    class="c-match-result"
    :to="
      localePath({
        name: 'competitions-competition-season-match-matchId',
        params: { matchId: match.id },
      })
    "
  >
    <template v-if="match.home_team">
      <img
        v-if="match.home_team.avatarMediumUrl"
        :src="match.home_team.avatarMediumUrl"
        class="c-match-result__team-avatar"
      />
      <div v-else class="c-match-result__team-avatar c-match-result__team-avatar--placeholder"></div>
      <div class="c-match-result__team-name" :class="{ 'c-match-result__team-name--winner': match.hasHomeTeamWon }">
        {{ match.home_team.name }}
      </div>
      <div class="c-match-result__team-score">{{ match.home_team_score }}</div>
    </template>
    <div class="c-match-result__score-separator">-</div>
    <template v-if="match.away_team">
      <img
        v-if="match.away_team.avatarMediumUrl"
        :src="match.away_team.avatarMediumUrl"
        class="c-match-result__team-avatar"
      />
      <div v-else class="c-match-result__team-avatar c-match-result__team-avatar--placeholder"></div>
      <div class="c-match-result__team-name" :class="{ 'c-match-result__team-name--winner': match.hasAwayTeamWon }">
        {{ match.away_team.name }}
      </div>
      <div class="c-match-result__team-score">{{ match.away_team_score }}</div>
    </template>
    <st-chip v-if="match.hasScore && !match.finished" class="c-match-result__additional-info">
      {{ $t('match.toBeConfirmed') }}
    </st-chip>
  </nuxt-link>
</template>

<script setup lang="ts">
import type Match from '~/models/match.model';

const localePath = useLocalePath();

defineProps({
  match: {
    type: Object as PropType<Match>,
    required: true,
  },
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-match-result {
  display: grid;
  grid-template-columns: min-content auto min-content;
  grid-template-areas:
    'additional-info additional-info additional-info'
    'home-team-avatar home-team-name home-team-score'
    'away-team-avatar away-team-name away-team-score';
  align-items: center;
  gap: var(--st-length-spacing-xxs) var(--st-length-spacing-xs);
  width: 100%;
  padding: var(--st-length-spacing-xs) 0;
  color: inherit;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.2s ease-in;
}

.c-match-result:hover {
  box-shadow: rgba(149 157 165 / 20%) 0 8px 24px;
  transform: translateY(-2px);
}

.c-match-result__team-name {
  text-align: left;
}

.c-match-result__team-name:nth-child(1 of .c-match-result__team-name) {
  grid-area: home-team-name;
}

.c-match-result__team-name:nth-child(2 of .c-match-result__team-name) {
  grid-area: away-team-name;
}

.c-match-result__team-name--winner {
  font-weight: bold;
}

.c-match-result__team-score {
  padding: 0;
  color: var(--st-color-match-score);
  font-weight: bold;
  width: 2em;
}

.c-match-result__team-score:nth-child(1 of .c-match-result__team-score) {
  grid-area: home-team-score;
}

.c-match-result__team-score:nth-child(2 of .c-match-result__team-score) {
  grid-area: away-team-score;
}

.c-match-result__score-separator {
  grid-area: score-separator;
  display: none;
  color: var(--st-color-match-score);
  font-weight: bold;
}

.c-match-result__team-avatar {
  width: 40px;
  height: 40px;
}

.c-match-result__team-avatar:nth-child(1 of .c-match-result__team-avatar) {
  grid-area: home-team-avatar;
}

.c-match-result__team-avatar:nth-child(2 of .c-match-result__team-avatar) {
  grid-area: away-team-avatar;
}

.c-match-result__additional-info {
  grid-area: additional-info;
  justify-self: center;
}

@media (--sm-and-up) {
  .c-match-result {
    grid-template-columns: 1fr min-content min-content min-content min-content min-content 1fr;
    grid-template-areas:
      'home-team-name home-team-avatar home-team-score score-separator away-team-score away-team-avatar away-team-name'
      'empty-left empty-left additional-info additional-info additional-info empty-right empty-right';
    padding: var(--st-length-spacing-xs) 0 var(--st-length-spacing-xxs);
  }

  .c-match-result__team-name:nth-child(1 of .c-match-result__team-name) {
    text-align: right;
  }

  .c-match-result__team-score:nth-child(1 of .c-match-result__team-score) {
    text-align: right;
  }

  .c-match-result__team-score:nth-child(2 of .c-match-result__team-score) {
    text-align: left;
  }

  .c-match-result__score-separator {
    display: block;
  }
}
</style>
