<template>
  <div>
    <p v-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="!$fetchState.pending" class="directus-formatted-content" v-html="textEntry.body"></div>
    <a
      class="twitter-timeline"
      :data-lang="$i18n.locale"
      data-dnt="true"
      data-width="800"
      data-link-color="#ff0000"
      href="https://twitter.com/SwissTchoukball?ref_src=twsrc%5Etfw"
    >
      <st-loader />
    </a>
    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import stLoader from '~/components/st-loader.vue';
import { TextEntry } from '~/plugins/cms-service';

export default Vue.extend({
  components: { stLoader },
  data() {
    return {
      textEntry: undefined as TextEntry | undefined,
    };
  },
  async fetch() {
    this.textEntry = await this.$cmsService.getText(4);
  },
});
</script>

<style>
.twitter-timeline {
  /* !important is used to override Twitter iframe */
  display: block !important;
  margin: auto;
  margin-top: var(--st-length-spacing-s) !important;
}
</style>
