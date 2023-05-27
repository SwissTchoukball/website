<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ redirect, localePath }) {
    redirect(localePath('wtc2023-live'));
  },
});
</script>
