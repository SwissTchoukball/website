<template>
  <div>
    <st-loader v-if="$fetchState.pending" main />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <div v-else class="c-standings__table-container">
      <table class="c-standings__table">
        <tr>
          <th
            v-for="(value, index) of standingsHeader"
            :key="index"
            class="c-standings__table-cell c-standings__table-cell--header"
          >
            {{ value }}
          </th>
        </tr>
        <tr v-for="(row, rowIndex) of rows" :key="`row-${rowIndex}`">
          <td v-for="(cell, cellIndex) of row" :key="`cell-${rowIndex}-${cellIndex}`" class="c-standings__table-cell">
            {{ cell }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase/classement',
      de: '/wettbewerbe/:competition/:season/:phase/tabelle',
    },
  },
  data() {
    return {
      rows: [] as string[],
      stats: [],
    };
  },
  async fetch() {
    const response = await this.$leverade.getStandings(this.$route.params.phase);
    this.rows = response.data.meta.standingsrows.map((row: any) => {
      const standing: (string | number)[] = [row.position, row.name];

      row.standingsstats.forEach((stat: { type: string; value: number }) => {
        switch (stat.type) {
          case 'played_matches':
            standing[2] = stat.value;
            break;
          case 'won_matches':
            standing[3] = stat.value;
            break;
          case 'drawn_matches':
            standing[4] = stat.value;
            break;
          case 'lost_matches':
            standing[5] = stat.value;
            break;
          case 'value':
            standing[6] = stat.value;
            break;
          case 'value_against':
            standing[7] = stat.value;
            break;
          case 'value_difference':
            standing[8] = stat.value;
            break;
          case 'score':
            standing[9] = stat.value;
            break;
          default:
        }
      });

      return standing;
    });
  },
  computed: {
    standingsHeader() {
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
  },
  watch: {
    '$route.params.phase': '$fetch',
    '$route.params.season': '$fetch',
    '$route.params.competition': '$fetch',
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
  padding: 0.6rem 0.8rem;
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
</style>
