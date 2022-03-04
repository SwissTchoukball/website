<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ app, redirect }) {
    redirect(
      app.localePath({
        name: 'competitions-competition',
        params: {
          competition: 'coupe-suisse',
        },
      })
    );
  },
});
</script>
