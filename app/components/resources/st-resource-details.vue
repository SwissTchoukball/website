<template>
  <div class="c-resource-details">
    <span v-if="fileType">{{ fileType }}</span>
    <span v-if="formattedFileSize">{{ formattedFileSize }}</span>
    <span v-if="date">{{ date }}</span>
  </div>
</template>

<script setup lang="ts">
import { useResource } from '~/composables/useResource';
import type { Resource } from '~/plugins/08.cms-service';

const props = defineProps({
  resource: {
    type: Object as PropType<Resource>,
    required: true,
  },
});

const { fileType, formattedFileSize, date } = useResource(props.resource);
</script>
<style scoped>
.c-resource-details {
  display: flex;
  margin-top: var(--st-length-spacing-xxs);
  color: var(--st-color-resource-details);
  font-size: 0.8em;
}

.c-resource-details > *::after {
  content: '\2022';
  display: inline-block;
  padding: 0 var(--st-length-spacing-xxs);
}

.c-resource-details > *:last-child::after {
  display: none;
}
</style>
