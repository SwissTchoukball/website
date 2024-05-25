<template>
  <div class="c-resource-details">
    <span v-if="fileType">{{ fileType }}</span>
    <span v-if="formattedFileSize">{{ formattedFileSize }}</span>
    <span v-if="date">{{ date }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import resourceMixin from '~/mixins/resource.mixin';

export default defineComponent({
  mixins: [resourceMixin],
});
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
