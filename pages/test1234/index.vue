<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  asyncData({ redirect, localePath }) {
    redirect(localePath('test1234-live'));
  },
});
</script>
