<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" main />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ competition.name }}</h2>
      <ul>
        <li v-for="edition of competition.editions" :key="edition.season.slug">
          <nuxt-link
            :to="
              localePath({
                name: 'competitions-competition-season',
                params: { competition: competition.slug, season: edition.season.slug },
              })
            "
          >
            {{ edition.season.name }}
          </nuxt-link>
        </li>
      </ul>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { NationalCompetition } from '~/components/competitions/competitions';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition',
      de: '/wettbewerbe/:competition',
    },
  },
  data() {
    return {
      competition: undefined as NationalCompetition | undefined,
    };
  },
  async fetch() {
    this.competition = await this.$cmsService.getNationalCompetition(this.$route.params.competition);

    // FIXME: This is a naive selection of the last edition. It might not work, i.e. when adding older editions.
    const lastEdition = this.competition.editions[this.competition.editions.length - 1];

    // TODO: Also retrieve the phase data to directly redirect at the correct page
    //       instead of doing redirect over redirect.
    //       This would require caching of phases to avoid fetching them twice.

    // If no season is selected, we redirect to the last one
    if (!this.$route.params.season) {
      const redirectPath = this.localePath({
        name: 'competitions-competition-season',
        params: {
          competition: this.$route.params.competition,
          season: lastEdition.season.slug,
        },
      });
      if (process.server) {
        this.$nuxt.context.redirect(redirectPath);
      } else if (process.client) {
        this.$router.replace(redirectPath);
      }
    }
  },
});
</script>
