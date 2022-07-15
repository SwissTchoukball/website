<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/coupesuisse',
      de: '/schweizercup',
    },
  },
  asyncData({ app, redirect }) {
    redirect(
      app.localePath({
        name: 'competitions-competition',
        params: {
          competition: app.i18n.locale === 'de' ? 'schweizer-cup' : 'coupe-suisse',
        },
      })
    );
  },
});
</script>
