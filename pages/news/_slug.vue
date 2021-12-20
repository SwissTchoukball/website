<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-news v-else :news-entry="newsEntry" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
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
    let id: number;
    if (slug.includes('-')) {
      id = parseInt(slug.substr(0, slug.indexOf('-')));
    } else {
      id = parseInt(slug);
    }

    if (!id) {
      throw new Error('Invalid news ID');
    }

    this.newsEntry = await this.$cmsService.getOneNews(id);
  },
  head(): MetaInfo {
    return {
      title: this.newsEntry?.title,
    };
  },
});
</script>
