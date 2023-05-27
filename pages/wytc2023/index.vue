<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ redirect, localePath }) {
    redirect(localePath('wytc2023-about'));
  },
});
</script>
