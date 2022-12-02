<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/calendrier/:year',
      de: '/kalender/:year',
    },
  },
  asyncData({ redirect, localePath, route }) {
    redirect(
      localePath({
        name: 'calendar-year-month-list',
        params: { year: route.params.year, month: '1' },
      })
    );
  },
});
</script>
