<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/calendrier',
      de: '/kalender',
    },
  },
  asyncData({ redirect, localePath }) {
    const now = new Date();
    redirect(
      localePath({
        name: 'calendar-year-month-list',
        params: { year: now.getFullYear().toString(), month: (now.getMonth() + 1).toString() },
      })
    );
  },
});
</script>
