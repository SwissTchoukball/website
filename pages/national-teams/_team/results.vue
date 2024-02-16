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
            :alt="
              $t('nationalTeams.results.logoOf', {
                name: result.competition.name,
                year: result.competition.year,
              }).toString()
            "
            class="c-results__competition-logo"
          />
          <h4 class="t-headline-3 c-results__competition-name">
            {{ result.competition.name }}<br />
            {{ result.competition.year }}
          </h4>
          <p class="c-results__competition-location">
            {{ result.competition.city }} - {{ result.competition.country }}
          </p>
          <st-medal class="c-results__ranking" :rank="result.ranking" />
        </li>
      </ul>
    </template>
    <!-- <div v-if="team.results.length && hasNationsCupResults" class="l-separator"></div> -->
    <div v-if="hasNationsCupResults" id="nations-cup" class="c-results__nations-cup">
      <h3 class="u-visually-hidden">{{ $t('nationalTeams.results.nationsCup') }}</h3>
      <img
        :src="`/images/logo-nations-cup.svg`"
        :alt="$t('footer.logoFrom', { orgName: $t('nationalTeams.results.nationsCup') }).toString()"
        class="c-results__nations-cup-logo"
      />
      <ul class="u-unstyled-list">
        <li v-for="(years, ranking) in nationsCupDistribution" :key="ranking" class="c-results__nations-cup-ranking">
          <st-medal class="c-results__ranking" :rank="ranking" />
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
import { defineComponent, PropType } from 'vue';
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import { getAssetURL } from '~/plugins/directus';

export default defineComponent({
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
  head() {
    const title = this.$t(`nationalTeams.headTitle.results`, {
      teamName: (this as any).team.name.toLowerCase(),
    }).toString();
    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t(`nationalTeams.description.results`).toString(),
        },
      ],
    };
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
  margin: var(--st-length-spacing-xs);
  text-align: center;
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
