<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/championnat',
      de: '/meisterschaft',
    },
  },
  asyncData({ app, redirect }) {
    redirect(
      app.localePath({
        name: 'competitions-competition',
        params: {
          competition: app.i18n.locale === 'de' ? 'liga-a' : 'ligue-a',
        },
      })
    );
  },
});
</script>
