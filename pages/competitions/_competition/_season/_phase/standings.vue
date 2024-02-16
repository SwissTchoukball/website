<template>
  <div>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <div v-else class="c-standings__table-container">
      <table class="c-standings__table">
        <thead>
          <tr>
            <th
              v-for="(value, index) of standingsHeader"
              :key="index"
              class="c-standings__table-cell c-standings__table-cell--header"
            >
              {{ value }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(standing, index) of standings" :key="standing.team ? standing.team.id : `unknown-${index}`">
            <td class="c-standings__table-cell">{{ standing.position }}</td>
            <td v-if="standing.team" class="c-standings__table-cell">
              <div class="c-standings__team">
                <img
                  v-if="standing.team.avatarMediumUrl"
                  :src="standing.team.avatarMediumUrl"
                  class="c-standings__team-avatar"
                />
                <div v-else class="c-standings__team-avatar c-standings__team-avatar--placeholder"></div>
                {{ standing.team.name }}
              </div>
            </td>
            <td v-for="statKey of standingsStatKeys" :key="statKey" class="c-standings__table-cell">
              {{ getStatValueForKey(standing, statKey) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import VueI18n from 'vue-i18n';
import Season from '~/models/season.model';
import Phase from '~/models/phase.model';
import Team from '~/models/team.model';
import CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType, LeveradeStandings, LeveradeTeam } from '~/plugins/leverade';

interface StandingRow<T> {
  position: number;
  team: T | undefined;
  stats: LeveradeStandings['standingsrows'][0]['standingsstats'];
}

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase/classement',
      de: '/wettbewerbe/:competition/:season/:phase/tabelle',
    },
  },
  props: {
    season: {
      type: Object as PropType<Season>,
      required: true,
    },
    competitionEdition: {
      type: Object as PropType<CompetitionEdition>,
      required: true,
    },
    phase: {
      type: Object as PropType<Phase>,
      required: true,
    },
  },
  data() {
    return {
      rawStandings: [] as StandingRow<LeveradeTeam>[],
      stats: [],
    };
  },
  async fetch() {
    // If we're not in a league phase (e.g. play-off phase), we redirect to the results
    if (this.phase.type !== LeveradeGroupType.LEAGUE) {
      const resultsPath = this.localePath({
        name: 'competitions-competition-season-phase-results',
      });
      if (process.server) {
        this.$nuxt.context.redirect(resultsPath);
      } else if (process.client) {
        this.$router.replace(resultsPath);
      }
    }

    const teamsResponse = await this.$leverade.getTeams(this.phase.competition_edition_id);
    const standingsResponse = await this.$leverade.getStandings(this.phase.id);
    this.rawStandings = standingsResponse.data.meta.standingsrows.map((row) => ({
      position: row.position,
      team: teamsResponse.data.data.find((team) => +team.id === row.id),
      stats: row.standingsstats,
    }));
  },
  head() {
    const title = this.$t('competitions.headTitle.standings', {
      phaseName: this.phase.name,
      editionName: this.competitionEdition.name,
      seasonName: this.season.name,
    }).toString();
    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('competitions.description.standings').toString(),
        },
      ],
    };
  },
  computed: {
    standingsHeader(): VueI18n.TranslateResult[] {
      return [
        '',
        this.$t('competitions.standings.header.team'),
        this.$t('competitions.standings.header.played'),
        this.$t('competitions.standings.header.won'),
        this.$t('competitions.standings.header.drawn'),
        this.$t('competitions.standings.header.lost'),
        this.$t('competitions.standings.header.scored'),
        this.$t('competitions.standings.header.received'),
        this.$t('competitions.standings.header.diff'),
        this.$t('competitions.standings.header.points'),
      ];
    },
    standingsStatKeys(): string[] {
      return [
        'played_matches',
        'won_matches',
        'drawn_matches',
        'lost_matches',
        'value',
        'value_against',
        'value_difference',
        'score',
      ];
    },
    standings(): StandingRow<Team>[] {
      return this.rawStandings.map((standingRow) => ({
        position: standingRow.position,
        team: standingRow.team ? new Team(standingRow.team) : undefined,
        stats: standingRow.stats,
      }));
    },
  },
  watch: {
    '$route.params.phase': '$fetch',
    '$route.params.season': '$fetch',
    '$route.params.competition': '$fetch',
  },
  methods: {
    getStatValueForKey(standing: StandingRow<Team>, statKey: string): number {
      return standing.stats.find((stat) => stat.type === statKey)?.value || 0;
    },
  },
});
</script>

<style scoped>
.c-standings__table-container {
  width: 100%;
  overflow-x: scroll;
}

.c-standings__table {
  margin-top: var(--st-length-spacing-s);
  border-collapse: collapse;
  width: 100%;
}

.c-standings__table-cell {
  padding: var(--st-length-spacing-xxs);
  border-bottom: 1px solid grey;
  text-align: center;
}

/* Ranking cell */
.c-standings__table-cell:nth-child(1) {
  font-weight: bold;
  width: 2rem;
}

/* Team name cell */
.c-standings__table-cell:nth-child(2) {
  text-align: left;
  font-weight: bold;
  white-space: nowrap;
}

.c-standings__table-cell--header {
  color: grey;
  font-weight: bold;
  font-size: 0.8em;
}

.c-standings__team {
  display: flex;
  align-items: center;
}

.c-standings__team-avatar {
  width: 50px;
  height: 50px;
  margin-right: var(--st-length-spacing-xs);
}
</style>
