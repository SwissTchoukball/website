<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" class="c-news-entry__loader" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <st-news v-else :news-entry="newsEntry" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { NewsEntry } from '~/components/news/st-news';
import stNews from '~/components/news/st-news.vue';

export default Vue.extend({
  components: { stNews },
  data() {
    return {
      newsEntry: undefined as NewsEntry | undefined,
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    const id = parseInt(slug.substr(0, slug.indexOf('-')));
    this.newsEntry = await this.$cmsService.getOneNews(id);
  },
});
</script>

<style scoped>
.c-news-entry__loader {
  margin-top: auto;
}
</style>
