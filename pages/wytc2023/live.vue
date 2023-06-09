<template>
  <div>
    <p v-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="!$fetchState.pending" class="directus-formatted-content" v-html="textEntry.body"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TextEntry } from '~/plugins/cms-service';

export default Vue.extend({
  data() {
    return {
      textEntry: undefined as TextEntry | undefined,
    };
  },
  async fetch() {
    this.textEntry = await this.$cmsService.getText(12);
  },
});
</script>
