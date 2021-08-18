<template>
  <div class="c-results">
    <template v-if="team.results.length">
      <st-link-action
        v-if="hasNationsCupResults"
        href="#nations-cup"
        with-arrow-down
        class="c-results__nations-cup-link"
      >
        {{ $t('nationalTeams.results.nationsCup') }}
      </st-link-action>
      <ul class="u-unstyled-list c-results__list">
        <li v-for="result of team.results" :key="result.competition.id" class="c-results__result">
          <img
            v-if="result.competition.logo"
            :src="logoSrc(result.competition.logo)"
            :srcset="logoSrcSet(result.competition.logo)"
            :alt="$t('nationalTeams.results.logoOf', { name: result.competition.name, year: result.competition.year })"
            class="c-results__competition-logo"
          />
          <h4 class="t-headline-3 c-results__competition-name">
            {{ result.competition.name }}<br />
            {{ result.competition.year }}
          </h4>
          <p class="c-results__competition-location">
            {{ result.competition.city }} - {{ result.competition.country }}
          </p>
          <div
            class="c-results__ranking"
            :class="`c-results__ranking--rank-${result.ranking}`"
            :title="$t('nationalTeams.results.rank', { rank: result.ranking })"
          >
            {{ result.ranking }}
          </div>
        </li>
      </ul>
    </template>
    <!-- <div v-if="team.results.length && hasNationsCupResults" class="l-separator"></div> -->
    <div v-if="hasNationsCupResults" id="nations-cup" class="c-results__nations-cup">
      <h3 class="u-visually-hidden">{{ $t('nationalTeams.results.nationsCup') }}</h3>
      <img
        :src="`/images/logo-nations-cup.svg`"
        :alt="$t('footer.logoFrom', { orgName: $t('nationalTeams.results.nationsCup') })"
        class="c-results__nations-cup-logo"
      />
      <ul class="u-unstyled-list">
        <li v-for="(years, ranking) in nationsCupDistribution" :key="ranking" class="c-results__nations-cup-ranking">
          <div
            class="c-results__ranking"
            :class="`c-results__ranking--rank-${ranking}`"
            :title="$t('nationalTeams.results.rank', { rank: ranking })"
          >
            {{ ranking }}
          </div>
          <div class="c-results__nations-cup-years">{{ years.join(', ') }}</div>
        </li>
      </ul>
    </div>
    <p v-if="!team.results.length && !hasNationsCupResults" class="l-blank-slate-message">
      {{ $t('nationalTeams.noResults') }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import { getAssetURL } from '~/plugins/directus';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/:team/resultats',
      de: '/nationalteams/:team/resultate',
    },
  },
  props: {
    team: {
      type: Object as PropType<NationalTeam>,
      required: true,
    },
  },
  computed: {
    hasNationsCupResults() {
      return (
        this.team.nationsCupResults &&
        Object.keys(this.team.nationsCupResults).length > 0 &&
        this.team.nationsCupResults.constructor === Object
      );
    },
    nationsCupDistribution() {
      // Distribute results per ranking
      return Object.entries(this.team.nationsCupResults).reduce((results, [year, ranking]) => {
        let newRanking;
        if (results[ranking]) {
          newRanking = [...results[ranking], year];
        } else {
          newRanking = [year];
        }
        return {
          ...results,
          [ranking]: newRanking,
        };
      }, {} as { [ranking: string]: string[] });
    },
  },
  methods: {
    logoSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, { height: 150 });
    },
    logoSrcSet(assetId: string): string {
      return `${getAssetURL(this.$config.cmsURL, assetId, { height: 300 })} 2x`;
    },
  },
});
</script>

<style scoped>
.c-results {
  margin-top: var(--st-length-spacing-m);
}

.c-results__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--st-length-spacing-m);
}

.c-results__result {
  margin-top: var(--st-length-spacing-s);
  width: 100%;
  text-align: center;
}

.c-results__competition-logo {
  height: 150px;
}

.c-results__competition-location {
  color: var(--st-color-national-team-result-location);
  font-weight: bold;
}

.c-results__ranking {
  display: inline-block;
  font-weight: 900;
  font-size: 2em;
  width: 1.5em;
  height: 1.5em;
  margin: var(--st-length-spacing-xs);
  border-radius: 50%;
  padding-top: 0.1em;
  border: 1px solid var(--st-color-medal-none);
  text-align: center;
}

.c-results__ranking--rank-1 {
  background-color: var(--st-color-medal-gold);
}

.c-results__ranking--rank-2 {
  background-color: var(--st-color-medal-silver);
}

.c-results__ranking--rank-3 {
  background-color: var(--st-color-medal-bronze);
}

.c-results__nations-cup-link {
  display: block;
  text-align: right;
}

.c-results__nations-cup {
  margin-top: var(--st-length-spacing-m);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-results__nations-cup-ranking {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.c-results__nations-cup-years {
  font-size: 1.2em;
}

@media (--sm-and-up) {
  .c-results__result {
    width: 50%;
  }
}

@media (--md-and-up) {
  .c-results__result {
    width: 33%;
  }
}
</style>
