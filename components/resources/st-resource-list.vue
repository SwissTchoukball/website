<template>
  <ul class="u-unstyled-list c-resource-list">
    <li
      v-for="(resource, index) of resources"
      :key="resource ? resource.id : `unknown-${index}`"
      class="c-resource-list__item"
    >
      <st-resource :resource="resource" />
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Resource } from '~/plugins/cms-service';
import stResource from '~/components/resources/st-resource.vue';

export default defineComponent({
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
