<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-news v-else-if="newsEntry" :news-entry="newsEntry" />
  </section>
</template>

<script lang="ts">
import { decode } from 'html-entities';
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import { NewsEntry } from '~/components/news/st-news';
import stNews from '~/components/news/st-news.vue';
import { getAssetURL } from '~/plugins/06.directus';

export default defineComponent({
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
    const title = this.newsEntry?.title || 'News';
    const description = this.newsEntry?.body
      ? decode(this.newsEntry.body.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
      : '';

    const metaInfo: MetaInfo = {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
        {
          hid: 'og:type',
          property: 'og:type',
          content: `article`,
        },
      ],
    };

    if (this.newsEntry?.main_image) {
      metaInfo.meta?.push(
        {
          hid: 'og:image',
          property: 'og:image',
          content: getAssetURL(this.$config.cmsURL, this.newsEntry.main_image.id, this.$config.ogImageParams),
        },
        {
          hid: 'og:image:alt',
          property: 'og:image:alt',
          content: this.newsEntry.main_image.description || '',
        },
      );
    }

    return metaInfo;
  },
});
</script>
