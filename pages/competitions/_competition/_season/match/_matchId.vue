<template>
  <div>
    <nuxt-link class="c-match__phase-round" :to="phaseRoundLink">
      <span v-if="isPhaseNameVisible">
        {{ match.round.phase.name }}
      </span>
      <span v-if="isRoundNameVisible">
        {{ match.round.name }}
      </span>
    </nuxt-link>
    <h2 class="c-match__name">
      <div class="c-match__team c-match__team--home" :class="{ 'c-match__team--winner': hasHomeTeamWon(match) }">
        {{ match.homeTeamName }}
      </div>
      <div class="c-match__cross">&#9587;</div>
      <div class="c-match__team c-match__team--away" :class="{ 'c-match__team--winner': hasAwayTeamWon(match) }">
        {{ match.awayTeamName }}
      </div>
    </h2>
    <div class="c-match__avatars-and-score">
      <img
        v-if="match.home_team && match.home_team.avatarLargeUrl"
        :src="match.home_team.avatarLargeUrl"
        class="c-match__team-avatar"
      />
      <div v-else class="c-match__team-avatar"></div>

      <div v-if="isOver" class="c-match__score">{{ match.home_team_score }} - {{ match.away_team_score }}</div>
      <div v-else class="c-match__no-score"></div>

      <img
        v-if="match.away_team && match.away_team.avatarLargeUrl"
        :src="match.away_team.avatarLargeUrl"
        class="c-match__team-avatar"
      />
      <div v-else class="c-match__team-avatar"></div>
    </div>
    <ul v-if="periods" class="c-match__detailed-score u-unstyled-list">
      <template v-for="period in periods">
        <li
          v-if="period.home_team_score || period.away_team_score"
          :key="period.order"
          v-tooltip.bottom="period.name"
          class="c-match__period"
        >
          {{ period.home_team_score || 0 }} - {{ period.away_team_score || 0 }}
        </li>
      </template>
    </ul>
    <div v-if="match.referees && match.referees.length" class="c-match__referees">
      <st-custom-icon :view-box-width="512" :view-box-height="512" class="c-match__icon">
        <st-icon-whistle />
      </st-custom-icon>
      <ul class="u-unstyled-list c-match__referee-list">
        <li v-for="referee in match.referees" :key="`${referee.first_name} ${referee.last_name}`">
          {{ referee.first_name }} {{ referee.last_name }}
        </li>
      </ul>
    </div>
    <div id="match-details" class="c-match__details">
      <st-event-date v-if="match.parsedDate()" :start-date="match.parsedDate()" always-one-line />
      <div v-if="match.parsedDate()">
        <fa-icon icon="clock" class="c-match__icon" /> {{ $formatDate(match.parsedDate(), 'HH:mm') }}
      </div>
      <button v-if="match.facility" class="u-unstyled-button c-match__venue" @click="showVenueDetails">
        <fa-icon icon="location-dot" class="c-match__icon" /> {{ match.facility.name }},
        {{ match.facility.city }} (<span class="c-match__venue-map-action">{{ $t('venue.map') }}</span
        >)
      </button>
      <div v-else class="c-match__venue c-match__venue--undefined">
        <fa-icon icon="location-dot" class="c-match__icon" /> {{ $t('venue.undefined') }}
      </div>
    </div>
    <div v-if="venueDetailsVisible" id="venue-details" class="c-match__venue-details">
      <div class="c-match__address">
        <fa-icon icon="location-dot" class="c-match__icon" />
        <div v-if="match.facility">
          <strong>{{ match.facility.name }}</strong> <br />
          {{ match.facility.address }}<br />
          {{ match.facility.postal_code }} {{ match.facility.city }}<br />
          <a :href="mapsUrl">{{ $t('venue.openInMaps') }}</a>
        </div>
      </div>
      <client-only>
        <iframe v-if="swisstopoMapUrl" :src="swisstopoMapUrl" frameborder="0" class="c-match__map"></iframe>
      </client-only>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Match from '~/models/match.model';
import StEventDate from '~/components/events/st-event-date.vue';
import StCustomIcon from '~/components/icon/st-custom-icon.vue';
import StIconWhistle from '~/components/icon/st-icon-whistle.vue';
import { LeveradeGroupType } from '~/plugins/leverade';

export default Vue.extend({
  components: {
    StEventDate,
    StCustomIcon,
    StIconWhistle,
  },
  scrollToTop: true,
  data() {
    return {
      venueDetailsVisible: false,
    };
  },
  async fetch() {
    await this.$store.dispatch('loadMatch', this.$route.params.matchId);
  },
  head() {
    const match: Match = (this as any).match;
    let title = '';
    if (match.home_team && match.away_team) {
      title += `${match.home_team.name} - ${match.away_team.name} · `;
    }
    if (match.round?.phase) {
      title += `${match.round.name} · ${match.round.phase.name} · `;
      if (match.round.phase.name !== match.round.phase.competition_edition.name) {
        title += `${match.round.phase.competition_edition.name} · `;
      }
      title += match.round.phase.competition_edition.season.name;
    }

    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('competitions.description.match').toString(),
        },
      ],
    };
  },
  computed: {
    match(): Match {
      const match = Match.query()
        .whereId(this.$route.params.matchId)
        .with('home_team')
        .with('away_team')
        .with('facility')
        .with('faceoff')
        .with('round.phase')
        .with('round.phase.competition_edition')
        .with('round.phase.competition_edition.season')
        .first();
      if (!match) {
        throw new Error('No match found for this ID');
      }
      return match;
    },
    periods(): Match['periods'] {
      return [...this.match.periods].sort((periodA, periodB) => periodA.order - periodB.order);
    },
    isOver(): boolean {
      return this.match.home_team_score > 0 || this.match.away_team_score > 0;
    },
    isPhaseNameVisible(): boolean {
      return this.match.round.phase && this.match.round.phase.type !== LeveradeGroupType.PLAY_OFF;
    },
    isRoundNameVisible(): boolean {
      return (
        !!this.match.round?.phase?.name &&
        (!this.isPhaseNameVisible || this.match.round.name !== this.match.round.phase.name)
      );
    },
    /**
     * Links to the planning if the match we're viewing has not been played yet,
     * and if it has, it rather links to the results.
     */
    phaseRoundLink(): string {
      let pathName = 'competitions-competition-season-phase-planning';
      if (this.isOver) {
        pathName = 'competitions-competition-season-phase-results';
      }
      if (!this.match.round?.phase) {
        return '';
      }
      return this.localePath({ name: pathName, params: { phase: this.match.round.phase.id } });
    },
    mapsUrl(): string | null {
      if (!this.match.facility) {
        return null;
      }
      // This link will fallback to Google Maps if Apple Maps is not available
      return `//maps.apple.com/?q=${this.match.facility.address},${this.match.facility.postal_code}+${this.match.facility.city}`;
    },
    swisstopoMapUrl(): string | null {
      if (!this.match.facility) {
        return null;
      }
      const swisssearch = `${this.match.facility.address}, ${this.match.facility.postal_code} ${this.match.facility.city} limit: 1`;
      const bgLayer = 'ch.swisstopo.pixelkarte-farbe';
      return `//map.geo.admin.ch/embed.html?swisssearch=${swisssearch}&lang=${this.$i18n.locale}&bgLayer=${bgLayer}&showTooltip=true`;
    },
  },
  methods: {
    hasHomeTeamWon(match: Match): boolean {
      return match.home_team_score > match.away_team_score;
    },
    hasAwayTeamWon(match: Match): boolean {
      return match.home_team_score < match.away_team_score;
    },
    showVenueDetails(): void {
      this.venueDetailsVisible = true;
      this.$router.push('#match-details');
    },
  },
});
</script>

<style scoped>
.c-match__phase-round {
  display: block;
  text-align: center;
  color: var(--st-color-match-phase-round);
  font-weight: 900;
  text-transform: uppercase;
  text-decoration: none;
  margin-top: var(--st-length-spacing-s);
}

.c-match__phase-round > *:not(:last-child)::after {
  content: '-';
}

.c-match__name {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: 900;
  margin-top: var(--st-length-spacing-xs);
}

.c-match__team {
  flex: 1 1 0;
}

.c-match__team--home {
  text-align: right;
}

.c-match__team--winner {
  text-decoration: underline;
}

.c-match__cross {
  margin: 0 var(--st-length-spacing-s);
}

.c-match__avatars-and-score {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--st-length-spacing-s);
}

.c-match__team-avatar {
  width: 30vw;
  height: 30vw;
  max-width: 250px;
  max-height: 250px;
}

.c-match__score {
  margin: var(--st-length-spacing-xs);
  color: var(--st-color-match-score);
  font-weight: 900;
  font-size: 1.5em;
  white-space: nowrap;
}

.c-match__no-score {
  width: 10vw;
}

.c-match__detailed-score {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-weight: bold;
  margin-top: var(--st-length-spacing-s);
}

.c-match__period {
  white-space: nowrap;
}

.c-match__period:not(:last-child)::after {
  content: '/';
  padding-left: 0.9rem;
}

.c-match__referees {
  margin-top: var(--st-length-spacing-s);
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.c-match__referee-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.c-match__details {
  margin-top: var(--st-length-spacing-m);
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
}

.c-match__details > * {
  margin-bottom: var(--st-length-spacing-xxs);
}

.c-match__icon {
  color: var(--st-color-event-icon);
}

.c-match__details .c-match__icon {
  margin-left: var(--st-length-spacing-xs);
}

.c-match__venue {
  font-size: inherit;
  cursor: pointer;
}

.c-match__venue--undefined {
  cursor: default;
}

.c-match__venue-map-action {
  color: var(--st-color-link);
  text-decoration: underline;
}

.c-match__venue-details {
  position: relative;
  margin-top: var(--st-length-spacing-s);
}

.c-match__address {
  display: flex;
}

.c-match__address .c-match__icon {
  margin-right: var(--st-length-spacing-xxs);
}

.c-match__map {
  margin-top: var(--st-length-spacing-xs);
  width: 100%;
  height: 50vh;
  border: 0;
}

@media (--sm-and-up) {
  .c-match__name {
    font-size: 2em;
  }

  .c-match__score {
    margin: var(--st-length-spacing-s);
    font-size: 2.5em;
  }

  .c-match__detailed-score {
    font-size: 1.5em;
  }

  .c-match__referee-list {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
}

@media (--md-and-up) {
  .c-match__score {
    margin: var(--st-length-spacing-m);
    font-size: 3em;
  }

  .c-match__detailed-score {
    font-size: 1.8em;
  }
}
@media (--lg-and-up) {
  .c-match__score {
    margin: var(--st-length-spacing-l);
  }
}
</style>
