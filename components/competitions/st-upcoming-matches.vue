<template>
  <section class="l-main-content-section c-upcoming-matches">
    <h2 class="t-headline-1">{{ $t('competitions.upcomingMatches') }}</h2>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else-if="upcomingMatches.length > 0">
      <ul class="u-unstyled-list c-upcoming-matches__list">
        <template v-for="match of upcomingMatches">
          <li v-if="match.home_team && match.away_team" :key="match.id" class="c-upcoming-matches__match">
            <!-- <pre>{{ match }}</pre> -->
            <st-event-small
              :start-date="match.parsedDate()"
              :name="`${match.home_team.name} - ${match.away_team.name}`"
              :details="match.facility.name"
              :to="
                localePath({
                  name: 'competitions-competition-season-match-matchId',
                  params: {
                    competition: match.round.phase.competition_edition.competition.slug,
                    season: match.round.phase.competition_edition.season.slug,
                    matchId: match.id,
                  },
                })
              "
            />
          </li>
        </template>
      </ul>
      <st-link-action
        v-for="phase of relatedPhasesByEdition"
        :key="phase.id"
        with-arrow
        :to="
          localePath({
            name: 'competitions-competition-season-phase-planning',
            params: {
              competition: phase.competition_edition.competition.slug,
              season: phase.competition_edition.season.slug,
              phase: phase.id,
            },
          })
        "
        class="c-upcoming-matches__see-more-link"
      >
        {{
          $t('competitions.upcomingMatchesOfCompetition', {
            competitionName: phase.competition_edition.competition.name,
          })
        }}
      </st-link-action>
    </template>
    <p v-else class="l-blank-slate-message">
      {{ $t('competitions.noUpcomingMatches') }}
    </p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Match from '~/models/match.model';
import stEventSmall from '~/components/events/st-event-small.vue';
import Phase from '~/models/phase.model';

export default Vue.extend({
  components: { stEventSmall },
  async fetch() {
    if (!this.$store.state.upcomingMatchesLoaded) {
      await this.$store.dispatch('loadUpcomingMatches');
    }
  },
  computed: {
    upcomingMatches() {
      return Match.query()
        .with('home_team')
        .with('away_team')
        .with('facility')
        .with('round.phase.competition_edition.competition|season')
        .where('datetime', (datetime: string) => datetime >= this.$formatDate(new Date(), 'yyyy-MM-dd'))
        .limit(9)
        .get();
    },
    /**
     * Returns the first phase of each edition from all the upcoming matches
     */
    relatedPhasesByEdition(): Phase[] {
      const phases = this.upcomingMatches.reduce((phases, match) => {
        const matchPhase = match.round.phase;
        if (
          phases.some((phase) => phase.competition_edition.directus_id === matchPhase.competition_edition.directus_id)
        ) {
          return phases;
        }
        return [...phases, match.round.phase];
      }, [] as Phase[]);

      return phases;
    },
  },
});
</script>

<style scoped>
.c-upcoming-matches {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-upcoming-matches__list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.c-upcoming-matches__match {
  margin-top: var(--st-length-spacing-xs);
  padding-right: var(--st-length-spacing-xs);
  width: 100%;
}

.c-upcoming-matches__see-more-link {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-xs);
}

@media (--sm-and-up) {
  .c-upcoming-matches__list {
    flex-wrap: wrap;
    max-height: 13em;
  }
  .c-upcoming-matches__match {
    width: 50%;
  }
}

@media (--lg-and-up) {
  .c-upcoming-matches__match {
    width: 33%;
  }
}
</style>
