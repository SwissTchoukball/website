<template>
  <div>
    <template v-if="futureMatches.length > 0">
      <ul v-for="match of futureMatches" :key="match.id" class="u-unstyled-list">
        <li v-if="match.home_team && match.away_team">
          <nuxt-link
            class="c-planning__match"
            :to="localePath({ name: 'competitions-competition-season-match-matchId', params: { matchId: match.id } })"
          >
            <st-event-date :start-date="match.parsedDate()" always-one-line />
            <div v-if="showMatchRound(match)" class="c-planning__match-round">{{ match.round.name }}</div>
            <h4 class="c-planning__match-name">
              <div class="c-planning__match-team c-planning__match-team--home">
                <img
                  :src="`https://cdn.leverade.com/thumbnails/${match.home_team.avatarKey}.200x200.jpg`"
                  class="c-planning__match-team-avatar"
                />
                {{ match.home_team.name }}
              </div>
              <div class="c-planning__match-cross">&#9587;</div>
              <div class="c-planning__match-team c-planning__match-team--away">
                <img
                  :src="`https://cdn.leverade.com/thumbnails/${match.away_team.avatarKey}.200x200.jpg`"
                  class="c-planning__match-team-avatar"
                />
                {{ match.away_team.name }}
              </div>
            </h4>
            <div class="c-planning__match-details">
              <fa-icon icon="clock" class="c-planning__match-icon" /> {{ $formatDate(match.parsedDate(), 'HH:mm') }}
              <fa-icon icon="map-marker-alt" class="c-planning__match-icon" /> {{ match.facility.name }}
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
    return {
      title: this.$t('competitions.headTitle.planning', {
        phaseName: this.phase.name,
        editionName: this.phase.competition_edition.name,
        seasonName: this.phase.competition_edition.season.name,
      }).toString(),
    };
  },
  computed: {
    futureMatches(): Match[] {
      const matches = Match.query()
        .with('home_team')
        .with('away_team')
        .with('facility')
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
    showMatchRound(match: Match) {
      return match.round.phase.type === LeveradeGroupType.PLAY_OFF;
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
