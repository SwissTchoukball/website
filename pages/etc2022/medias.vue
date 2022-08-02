<template>
  <div>
    <h3 class="t-headline-2">{{ $t('etc2022.medias.title') }}</h3>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else class="directus-formatted-content" v-html="textEntry.body"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TextEntry } from '~/plugins/cms-service';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/etc2022/medias',
      de: '/etc2022/medien',
    },
  },
  data() {
    return {
      textEntry: undefined as TextEntry | undefined,
    };
  },
  async fetch() {
    this.textEntry = await this.$cmsService.getText(2);
  },
});
</script>
