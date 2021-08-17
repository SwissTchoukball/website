<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ app, route, redirect }) {
    // Setting default tab for a team to be the players list
    redirect(app.localePath({ name: 'national-teams-team-players', params: { team: route.params.team } }));
  },
});
</script>
