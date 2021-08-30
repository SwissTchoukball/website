<template>
  <ul class="u-unstyled-list c-resource-list">
    <li v-for="resource of resources" :key="resource.id" class="c-resource-list__item">
      <st-resource :resource="resource" />
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Resource } from '~/plugins/cms-service';
import stResource from '~/components/resources/st-resource.vue';

export default Vue.extend({
  components: { stResource },
  props: {
    resources: {
      type: Array as PropType<Resource[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.c-resource-list__item {
  margin-top: var(--st-length-spacing-s);
}
</style>
