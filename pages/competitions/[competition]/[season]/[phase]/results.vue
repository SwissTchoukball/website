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

<script setup lang="ts">
import type Season from '~/models/season.model';
import type Phase from '~/models/phase.model';
import type Round from '~/models/round.model';
import type Faceoff from '~/models/faceoff.model';
import type CompetitionEdition from '~/models/competition-edition.model';

const { t } = useI18n();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]/resultats',
    de: '/wettbewerbe/[competition]/[season]/[phase]/ergebnisse',
  },
});

const props = defineProps({
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
});

useHead(() => {
  const title = t('competitions.headTitle.results', {
    phaseName: props.phase.name,
    editionName: props.competitionEdition.name,
    seasonName: props.season.name,
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.results').toString(),
      },
    ],
  };
});

const roundsToShow = computed<Round[]>(() => {
  if (!props.phase?.rounds) {
    return [];
  }
  return props.phase.rounds
    .filter((round) => round.isPast || round.hasFinishedMatches)
    .sort((roundA, roundB) => roundB.order - roundA.order);
});

const isFaceoffAutoQualified = (faceoff: Faceoff): boolean => {
  if (!faceoff.matches?.length) {
    return false;
  }
  // We check this based on the first match only
  const firstMatch = faceoff.matches[0];
  return (!firstMatch.home_team || !firstMatch.away_team) && firstMatch.finished && !!faceoff.winner;
};

/**
 * Checks that a faceoff has a match with a least one team set.
 */
const faceoffHasMatches = (faceoff: Faceoff): boolean => {
  if (!faceoff.matches) {
    return false;
  }
  // We check this based on the first match only
  const firstMatch = faceoff.matches[0];
  return !!(firstMatch.home_team || firstMatch.away_team);
};

const getFaceoffWinnerName = (faceoff: Faceoff): string => {
  return faceoff.winner ? faceoff[`${faceoff.winner}_team`]?.name || '' : '';
};
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
