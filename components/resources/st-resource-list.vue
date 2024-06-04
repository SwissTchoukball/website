<template>
  <ul class="u-unstyled-list c-resource-list">
    <li
      v-for="(resource, index) of resources"
      :key="resource ? resource.id : `unknown-${index}`"
      class="c-resource-list__item"
    >
      <st-resource-list-item :resource="resource" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Resource } from '~/plugins/08.cms-service';

defineProps({
  resources: {
    type: Array as PropType<Resource[]>,
    required: true,
  },
});
</script>

<style scoped>
.c-resource-list__item {
  margin-top: var(--st-length-spacing-s);
}
</style>
