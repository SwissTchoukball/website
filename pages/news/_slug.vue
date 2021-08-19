<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" main />
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
