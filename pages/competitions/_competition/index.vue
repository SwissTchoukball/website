<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition',
      de: '/wettbewerbe/:competition',
    },
  },
  async asyncData({ app, route, redirect, store }) {
    const competition = await app.$cmsService.getNationalCompetition(route.params.competition);

    store.commit('competitions/setCompetitions', competition);

    if (!competition.lastEdition) {
      throw new Error('Competition has no editions');
    }

    if (typeof competition.lastEdition.season === 'number') {
      throw new TypeError('Season of last edition is not populated');
    }

    // TODO: Also retrieve the phase data to directly redirect at the correct page
    //       instead of doing redirect over redirect.
    //       This would require caching of phases to avoid fetching them twice.

    redirect(
      app.localePath({
        name: 'competitions-competition-season',
        params: {
          competition: route.params.competition,
          season: competition.lastEdition.season.slug,
        },
      })
    );
  },
});
</script>
