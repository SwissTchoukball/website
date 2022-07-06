<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  asyncData({ redirect }) {
    redirect('https://tchouk.ch/up');
  },
});
</script>
