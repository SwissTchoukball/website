<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ app, route, redirect }) {
    // Setting default tab for a phase to be the standings
    redirect(
      app.localePath({ name: 'competitions-competition-season-phase-standings', params: { phase: route.params.phase } })
    );
  },
});
</script>
