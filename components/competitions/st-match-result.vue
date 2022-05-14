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
    <div
      class="c-match-result__team c-match-result__team--home"
      :class="{ 'c-match-result__team--winner': hasHomeTeamWon }"
    >
      <img
        :src="`https://cdn.leverade.com/thumbnails/${match.home_team.avatarKey}.200x200.jpg`"
        class="c-match-result__team-avatar"
      />
      <div class="c-match-result__team-name">{{ match.home_team.name }}</div>
      <div class="c-match-result__score">{{ match.home_team_score }}</div>
    </div>
    <div class="c-match-result__score-separator">-</div>
    <div
      class="c-match-result__team c-match-result__team--away"
      :class="{ 'c-match-result__team--winner': hasAwayTeamWon }"
    >
      <img
        :src="`https://cdn.leverade.com/thumbnails/${match.away_team.avatarKey}.200x200.jpg`"
        class="c-match-result__team-avatar"
      />
      <div class="c-match-result__team-name">{{ match.away_team.name }}</div>
      <div class="c-match-result__score">{{ match.away_team_score }}</div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Match from '~/models/match.model';

export default Vue.extend({
  props: {
    match: {
      type: Object as PropType<Match>,
      required: true,
    },
  },
  computed: {
    hasHomeTeamWon(): boolean {
      return this.match.home_team_score > this.match.away_team_score;
    },
    hasAwayTeamWon(): boolean {
      return this.match.home_team_score < this.match.away_team_score;
    },
  },
});
</script>

<style scoped>
.c-match-result {
  display: block;
  width: 100%;
  padding: var(--st-length-spacing-xs) 0;
  color: inherit;
  text-decoration: none;
}

.c-match-result__team {
  display: flex;
  align-items: center;
}

.c-match-result__team--winner {
  font-weight: bold;
}

.c-match-result__team-name {
  flex-grow: 2;
  text-align: left;
}

.c-match-result__score {
  padding: var(--st-length-spacing-xs) 0;
  color: var(--st-color-match-score);
  font-weight: bold;
  width: 2em;
}

.c-match-result__score-separator {
  display: none;
  padding: var(--st-length-spacing-xs) var(--st-length-spacing-xxs);
  color: var(--st-color-match-score);
  font-weight: bold;
}

.c-match-result__team-avatar {
  width: 40px;
  height: 40px;
  margin-right: var(--st-length-spacing-xs);
  margin-left: var(--st-length-spacing-xs);
  margin-bottom: var(--st-length-spacing-xxs);
}

@media (--sm-and-up) {
  .c-match-result {
    display: flex;
    justify-content: center;
    padding: var(--st-length-spacing-xxs) 0;
  }

  .c-match-result__team {
    flex: 1 1 0;
  }

  .c-match-result__team--away {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .c-match-result__team--home {
    justify-content: flex-end;
  }

  .c-match-result__team-avatar {
    margin-bottom: 0;
    order: 2;
  }

  .c-match-result__team-name {
    order: 1;
  }

  .c-match-result__team--home .c-match-result__team-name {
    text-align: right;
  }

  .c-match-result__score {
    order: 3;
  }

  .c-match-result__team--home .c-match-result__score {
    text-align: right;
  }

  .c-match-result__team--away .c-match-result__score {
    text-align: left;
  }

  .c-match-result__score-separator {
    display: block;
  }
}
</style>
