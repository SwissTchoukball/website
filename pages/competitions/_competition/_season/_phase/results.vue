<template>
  <div class="c-results">
    <template v-if="roundsToShow.length > 0">
      <ul class="u-unstyled-list c-results__round">
        <li v-for="round of roundsToShow" :key="round.id" class="c-results__round">
          <template v-if="!round.faceoffs || !round.faceoffs.length">
            <h3 class="t-headline-2 c-results__round-name">{{ round.name }}</h3>
            <st-match-result-list :matches="round.matches || []" />
          </template>

          <template v-else>
            <div v-for="(faceoff, index) of round.faceoffs" :key="faceoff.id">
              <template v-if="faceoffHasMatches(faceoff)">
                <h3 class="c-results__round-name" :class="round.faceoffs.length > 1 ? 't-headline-3' : 't-headline-2'">
                  {{ round.name }}
                  <template v-if="round.faceoffs.length > 1">{{ index + 1 }}</template>
                </h3>

                <div v-if="isFaceoffAutoQualified(faceoff) && faceoff.winner">
                  {{ $t('competitions.results.autoQualified', { teamName: getFaceoffWinnerName(faceoff) }) }}
                </div>
                <st-match-result-list v-else :matches="faceoff.matches || []" />
              </template>
            </div>
          </template>
        </li>
      </ul>
    </template>
    <p v-else class="l-blank-slate-message">{{ $t('competitions.results.noResults') }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Season from '~/models/season.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import stMatchResultList from '~/components/competitions/st-match-result-list.vue';
import Faceoff from '~/models/faceoff.model';
import CompetitionEdition from '~/models/competition-edition.model';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition/:season/:phase/resultats',
      de: '/wettbewerbe/:competition/:season/:phase/ergebnisse',
    },
  },
  components: {
    stMatchResultList,
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
  head() {
    const title = this.$t('competitions.headTitle.results', {
      phaseName: (this as any).phase.name,
      editionName: (this as any).competitionEdition.name,
      seasonName: (this as any).season.name,
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
    roundsToShow(): Round[] {
      if (!this.phase?.rounds) {
        return [];
      }
      return this.phase.rounds
        .filter((round) => round.isPast || round.hasFinishedMatches)
        .sort((roundA, roundB) => roundB.order - roundA.order);
    },
  },
  methods: {
    isFaceoffAutoQualified(faceoff: Faceoff): boolean {
      if (!faceoff.matches?.length) {
        return false;
      }
      // We check this based on the first match only
      const firstMatch = faceoff.matches[0];
      return (!firstMatch.home_team || !firstMatch.away_team) && firstMatch.finished && !!faceoff.winner;
    },
    /**
     * Checks that a faceoff has a match with a least one team set.
     */
    faceoffHasMatches(faceoff: Faceoff): boolean {
      if (!faceoff.matches) {
        return false;
      }
      // We check this based on the first match only
      const firstMatch = faceoff.matches[0];
      return !!(firstMatch.home_team || firstMatch.away_team);
    },
    getFaceoffWinnerName(faceoff: Faceoff): string {
      return faceoff.winner ? faceoff[`${faceoff.winner}_team`]?.name || '' : '';
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
</style>
