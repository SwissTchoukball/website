<template>
  <article class="c-news-entry">
    <st-news-category-labels :categories="newsEntry.categories" />
    <h2 class="c-news-entry__title t-headline-1">{{ newsEntry.title }}</h2>
    <img
      v-if="newsEntry.main_image"
      class="c-news-entry__image"
      :alt="newsEntry.main_image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      sizes="(min-width: 1905px) 1905px, 100vw"
    />
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="newsEntry.body"></div>
    <p class="c-news-entry__dates">{{ dates }}</p>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NewsEntry } from '~/components/news/st-news';
import stNewsCategoryLabels from '~/components/news/st-news-category-labels.vue';
import { getAssetURL, getAssetSrcSet } from '~/plugins/directus';

export default Vue.extend({
  components: { stNewsCategoryLabels },
  props: {
    newsEntry: {
      type: Object as PropType<NewsEntry>,
      required: true,
    },
  },
  computed: {
    mainImageFallbackSrc(): string {
      return getAssetURL(this.$config.cmsURL, this.newsEntry.main_image.id, {
        width: this.$config.newsAssetsSizes[0],
      });
    },
    mainImageSrcSet(): string {
      return getAssetSrcSet(this.$config.cmsURL, this.newsEntry.main_image.id, {
        widths: this.$config.newsAssetsSizes,
      });
    },
    creationDate(): string {
      return this.$formatDate(new Date(this.newsEntry.date_created), 'PPP');
    },
    updateDate(): string {
      return this.$formatDate(new Date(this.newsEntry.date_updated), 'PPP');
    },
    dates(): string {
      let dates = `${this.$t('news.publishedOn')} ${this.creationDate}`;

      if (this.creationDate !== this.updateDate) {
        dates += `, ${this.$t('news.updatedOn')} ${this.updateDate}`;
      }

      return dates;
    },
  },
});
</script>

<style scoped>
.c-news-entry {
  margin-top: var(--st-length-spacing-m);
}

.c-news-entry__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-news-entry__image {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
  margin-top: var(--st-length-spacing-s);
  height: min(50vw, 60vh);
  object-fit: cover;
}

.c-news-entry__dates {
  margin-top: var(--st-length-spacing-s);
  color: var(--st-color-news-date-foreground);
}

.c-news-entry__dates::first-letter {
  text-transform: uppercase;
}

@media (--xl-and-up) {
  .c-news-entry__image {
    width: 1905px; /* l-xl breakpoint */
    margin-left: calc(-1 * (1905px - var(--st-length-main-content-max-width)) / 2);
    height: 60vh;
  }
}
</style>
