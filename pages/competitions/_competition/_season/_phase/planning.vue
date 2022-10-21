<template>
  <div>
    <template v-if="futureMatches.length > 0">
      <ul v-for="match of futureMatches" :key="match.id" class="u-unstyled-list">
        <li v-if="showMatch(match)">
          <nuxt-link
            class="c-planning__match"
            :to="localePath({ name: 'competitions-competition-season-match-matchId', params: { matchId: match.id } })"
          >
            <st-event-date :start-date="match.parsedDate()" always-one-line />
            <div v-if="showMatchRound(match)" class="c-planning__match-round">{{ match.round.name }}</div>
            <h4 v-if="match.homeTeamName || match.awayTeamName" class="c-planning__match-name">
              <div class="c-planning__match-team c-planning__match-team--home">
                <img
                  v-if="match.home_team && match.home_team.avatarMediumUrl"
                  :src="match.home_team.avatarMediumUrl"
                  class="c-planning__match-team-avatar"
                />
                <div v-else class="c-planning__match-team-avatar c-planning__match-team-avatar--placeholder"></div>
                {{ match.homeTeamName }}
              </div>

              <div class="c-planning__match-cross">&#9587;</div>

              <div class="c-planning__match-team c-planning__match-team--away">
                <img
                  v-if="match.away_team && match.away_team.avatarMediumUrl"
                  :src="match.away_team.avatarMediumUrl"
                  class="c-planning__match-team-avatar"
                />
                <div v-else class="c-planning__match-team-avatar c-planning__match-team-avatar--placeholder"></div>
                {{ match.awayTeamName }}
              </div>
            </h4>
            <div class="c-planning__match-details">
              <st-cancelled-label v-if="match.canceled" class="c-planning__match-cancelled" />
              <template v-else>
                <template v-if="showTime(match)">
                  <fa-icon icon="clock" class="c-planning__match-icon" />
                  {{ $formatDate(match.parsedDate(), 'HH:mm') }}
                </template>
                <fa-icon icon="location-dot" class="c-planning__match-icon" />
                {{ match.facility.name }}, {{ match.facility.city }}
              </template>
            </div>
          </nuxt-link>
        </li>
      </ul>
    </template>
    <p v-else class="l-blank-slate-message">{{ $t('competitions.planning.noMatches') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Phase from '~/models/phase.model';
import Match from '~/models/match.model';
import StEventDate from '~/components/events/st-event-date.vue';
import { LeveradeGroupType } from '~/plugins/leverade';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      StEventDatefr: '/competitions/:competition/:season/:phase/programme',
      de: '/wettbewerbe/:competition/:season/:phase/programm',
    },
  },
  components: {
    StEventDate,
  },
  props: {
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  head() {
    const title = this.$t('competitions.headTitle.planning', {
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
          content: this.$t('competitions.description.planning').toString(),
        },
      ],
    };
  },
  computed: {
    futureMatches(): Match[] {
      const matches = Match.query()
        .with('home_team')
        .with('away_team')
        .with('facility')
        .with('faceoff')
        .with('round', (query) => query.with('phase', (queryP) => queryP.where('id', this.phase.id)))
        .where('datetime', (datetime: string) => datetime >= this.$formatDate(new Date(), 'yyyy-MM-dd'))
        .orderBy('datetime')
        .get()
        // Somehow, this query retrieves some matches from other phases, without including the phase.
        // We filter those out here. FIXME: Find a cleaner way to fix this.
        .filter((match) => match.round.phase);

      return matches;
    },
  },
  methods: {
    showMatch(match: Match) {
      return this.showMatchRound(match) || match.home_team || match.away_team || !match.canceled;
    },
    showMatchRound(match: Match) {
      return match.round.phase.type === LeveradeGroupType.PLAY_OFF;
    },
    showTime(match: Match) {
      // This can be a problem if a match is actually scheduled at midnight.
      // Unfortunately, there's currently no way to differentiate a match for which the date is not set from one where it is scheduled at midnight.
      const matchParsedDate = match.parsedDate();
      return matchParsedDate && this.$formatDate(matchParsedDate, 'HH:mm') !== '00:00';
    },
  },
});
</script>

<style scoped>
.c-planning__match {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--st-length-spacing-xs);
  position: relative;
  margin-top: var(--st-length-spacing-s);
  width: 100%;
  color: inherit;
  text-decoration: none;
}

.c-planning__match-main {
  flex-grow: 2;
}

.c-planning__match-round {
  color: red;
  font-size: 0.9em;
  font-weight: bold;
  margin-top: var(--st-length-spacing-xxs);
}

.c-planning__match-name {
  display: flex;
  align-items: center;
  font-weight: 900;
  font-size: 1.2em;
  width: 100%;
}

.c-planning__match-team {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  align-self: flex-start;
}

.c-planning__match-team--home {
  align-items: flex-end;
  text-align: right;
}

.c-planning__match-team--away {
  align-items: flex-start;
  text-align: left;
}

.c-planning__match-cross {
  padding: var(--st-length-spacing-xs);
}

.c-planning__match-team-avatar {
  width: 50px;
  height: 50px;
}

.c-planning__match-team--home .c-planning__match-team-avatar {
  margin-left: var(--st-length-spacing-xs);
}

.c-planning__match-team--away .c-planning__match-team-avatar {
  margin-right: var(--st-length-spacing-xs);
}

.c-planning__match-details {
  margin-top: var(--st-length-spacing-xxs);
}

.c-planning__match-icon {
  color: var(--st-color-event-icon);
}

.c-planning__match-icon:not(:first-child) {
  margin-left: var(--st-length-spacing-xs);
}

@media (--sm-and-up) {
  .c-planning__match-team {
    flex-direction: row;
    align-items: center;
    align-self: center;
  }

  .c-planning__match-team--home {
    flex-direction: row-reverse;
  }
}
</style>
