<template>
  <div class="c-results">
    <template v-if="roundsUpToNow.length > 0">
      <ul class="u-unstyled-list c-results__round">
        <li v-for="round of roundsUpToNow" :key="round.id" class="c-results__round">
          <h3 class="t-headline-2 c-results__round-name">{{ round.name }}</h3>
          <ul class="u-unstyled-list">
            <template v-for="match of round.matches">
              <li v-if="match.home_team && match.away_team && !match.canceled" :key="match.id" class="c-results__match">
                <st-match-result :match="match" />
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
import stMatchResult from '~/components/competitions/st-match-result.vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase/resultats',
      de: '/wettbewerbe/:competition/:season/:phase/ergebnisse',
    },
  },
  components: {
    stMatchResult,
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
  border-bottom: 1px solid var(--st-color-match-results-separator);
}

.c-results__match:last-of-type {
  border-bottom: none;
}

@media (--sm-and-up) {
  .c-results__match {
    border-bottom: none;
  }
}
</style>
