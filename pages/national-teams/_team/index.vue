<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  asyncData({ app, route, redirect }) {
    // Setting default tab for a team to be the players list
    redirect(app.localePath({ name: 'national-teams-team-players', params: { team: route.params.team } }));
  },
});
</script>
