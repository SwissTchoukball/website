<script lang="ts">
import Vue from 'vue';
import Competition from '~/models/competition.model';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/competitions/:competition',
      de: '/wettbewerbe/:competition',
    },
  },
  async asyncData({ app, route, redirect }) {
    const competition = await app.$cmsService.getNationalCompetition(route.params.competition);
    const nationalCompetition = new Competition(competition);

    if (!nationalCompetition.lastEdition) {
      throw new Error('Competition has no editions');
    }

    if (typeof nationalCompetition.lastEdition.season === 'number') {
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
          season: nationalCompetition.lastEdition.season.slug,
        },
      })
    );
  },
});
</script>
