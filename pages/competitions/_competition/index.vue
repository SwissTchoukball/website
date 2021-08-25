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
    Competition.insert({ data: competition, insertOrUpdate: ['competition-editions'] });

    if (!competition.editions) {
      throw new Error('Competition has no editions');
    }
    // FIXME: This is a naive selection of the last edition. It might not work, i.e. when adding older editions.
    const lastEdition = competition.editions[competition.editions.length - 1];

    if (typeof lastEdition.season === 'number') {
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
          season: lastEdition.season.slug,
        },
      })
    );
  },
});
</script>
