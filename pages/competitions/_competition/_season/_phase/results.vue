<template>
  <div class="c-results">
    <template v-if="roundsUpToNow.length > 0">
      <ul class="u-unstyled-list c-results__round">
        <li v-for="round of roundsUpToNow" :key="round.id" class="c-results__round">
          <h3 class="t-headline-2 c-results__round-name">{{ round.name }}</h3>
          <ul class="u-unstyled-list">
            <template v-for="match of round.matches">
              <li v-if="match.home_team && match.away_team && !match.canceled" :key="match.id">
                <nuxt-link
                  class="c-results__match"
                  :to="
                    localePath({
                      name: 'competitions-competition-season-match-matchId',
                      params: { matchId: match.id },
                    })
                  "
                >
                  <div
                    class="c-results__match-team c-results__match-team--home"
                    :class="{ 'c-results__match-team--winner': hasHomeTeamWon(match) }"
                  >
                    <img
                      :src="`https://cdn.leverade.com/thumbnails/${match.home_team.avatarKey}.200x200.jpg`"
                      class="c-results__match-team-avatar"
                    />
                    <div class="c-results__match-team-name">{{ match.home_team.name }}</div>
                    <div class="c-results__match-score">{{ match.home_team_score }}</div>
                  </div>
                  <div class="c-results__match-score-separator">-</div>
                  <div
                    class="c-results__match-team c-results__match-team--away"
                    :class="{ 'c-results__match-team--winner': hasAwayTeamWon(match) }"
                  >
                    <img
                      :src="`https://cdn.leverade.com/thumbnails/${match.away_team.avatarKey}.200x200.jpg`"
                      class="c-results__match-team-avatar"
                    />
                    <div class="c-results__match-team-name">{{ match.away_team.name }}</div>
                    <div class="c-results__match-score">{{ match.away_team_score }}</div>
                  </div>
                </nuxt-link>
              </li>
            </template>
          </ul>
        </li>
      </ul>
    </template>
    <p v-else class="l-blank-slate-message">{{ $t('competitions.results.noResults') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import Match from '~/models/match.model';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase/resultats',
      de: '/wettbewerbe/:competition/:season/:phase/ergebnisse',
    },
  },
  props: {
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  head() {
    const title = this.$t('competitions.headTitle.results', {
      phaseName: this.phase.name,
      editionName: this.phase.competition_edition.name,
      seasonName: this.phase.competition_edition.season.name,
    }).toString();
    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('competitions.description.results').toString(),
        },
      ],
    };
  },
  computed: {
    roundsUpToNow(): Round[] {
      return this.phase.rounds.filter((round) => round.isPast).sort((roundA, roundB) => roundB.order - roundA.order);
    },
  },
  methods: {
    hasHomeTeamWon(match: Match) {
      return match.home_team_score > match.away_team_score;
    },
    hasAwayTeamWon(match: Match) {
      return match.home_team_score < match.away_team_score;
    },
  },
});
</script>

<style scoped>
.c-results {
  text-align: center;
}

.c-results__round {
  margin-bottom: var(--st-length-spacing-m);
}

.c-results__round-name {
  padding-bottom: var(--st-length-spacing-xs);
}

.c-results__match {
  display: block;
  width: 100%;
  padding: var(--st-length-spacing-xs) 0;
  border-bottom: 1px solid var(--st-color-match-results-separator);
  color: inherit;
  text-decoration: none;
}

li:last-of-type .c-results__match {
  border-bottom: none;
}

.c-results__match-team {
  display: flex;
  align-items: center;
}

.c-results__match-team--winner {
  font-weight: bold;
}

.c-results__match-team-name {
  flex-grow: 2;
  text-align: left;
}

.c-results__match-score {
  padding: var(--st-length-spacing-xs) 0;
  color: var(--st-color-match-score);
  font-weight: bold;
  width: 2em;
}

.c-results__match-score-separator {
  display: none;
  padding: var(--st-length-spacing-xs) var(--st-length-spacing-xxs);
  color: var(--st-color-match-score);
  font-weight: bold;
}

.c-results__match-team-avatar {
  width: 40px;
  height: 40px;
  margin-right: var(--st-length-spacing-xs);
  margin-left: var(--st-length-spacing-xs);
  margin-bottom: var(--st-length-spacing-xxs);
}

@media (--sm-and-up) {
  .c-results__match {
    display: flex;
    border-bottom: none;
    justify-content: center;
    padding: var(--st-length-spacing-xxs) 0;
  }

  .c-results__match-team {
    flex: 1 1 0;
  }

  .c-results__match-team--away {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .c-results__match-team--home {
    justify-content: flex-end;
  }

  .c-results__match-team-avatar {
    margin-bottom: 0;
    order: 2;
  }

  .c-results__match-team-name {
    order: 1;
  }

  .c-results__match-team--home .c-results__match-team-name {
    text-align: right;
  }

  .c-results__match-score {
    order: 3;
  }

  .c-results__match-team--home .c-results__match-score {
    text-align: right;
  }

  .c-results__match-team--away .c-results__match-score {
    text-align: left;
  }

  .c-results__match-score-separator {
    display: block;
  }
}
</style>
