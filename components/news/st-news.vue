<template>
  <article class="c-news-entry">
    <st-domain-labels :domains="newsEntry.domains" />
    <h2 class="c-news-entry__title t-headline-1">{{ newsEntry.title }}</h2>
    <img
      v-if="newsEntry.main_image"
      class="c-news-entry__image"
      :alt="newsEntry.main_image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="imgTagSizes"
    />
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content c-news-entry__body" v-html="newsEntry.body"></div>
    <p class="c-news-entry__dates">{{ dates }}</p>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NewsEntry } from '~/components/news/st-news';
import { getAssetURL, getAssetSrcSet } from '~/plugins/directus';

export default Vue.extend({
  props: {
    newsEntry: {
      type: Object as PropType<NewsEntry>,
      required: true,
    },
  },
  data() {
    return {
      imgTagSizes: '',
    };
  },
  computed: {
    mainImageFallbackSrc(): string {
      if (!this.newsEntry.main_image) {
        return '';
      }
      return getAssetURL(this.$config.cmsURL, this.newsEntry.main_image.id, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    mainImageSrcSet(): string {
      if (!this.newsEntry.main_image) {
        return '';
      }
      return getAssetSrcSet(this.$config.cmsURL, this.newsEntry.main_image.id, {
        widths: this.$config.keyVisualSizes,
      });
    },
    creationDate(): string {
      return this.$formatDate(new Date(this.newsEntry.date_created), 'PPP');
    },
    updateDate(): string | undefined {
      if (this.newsEntry.date_updated) {
        return this.$formatDate(new Date(this.newsEntry.date_updated), 'PPP');
      }
      return undefined;
    },
    dates(): string {
      let dates = `${this.$t('news.publishedOn')} ${this.creationDate}`;

      if (this.updateDate && this.creationDate !== this.updateDate) {
        dates += `, ${this.$t('news.updatedOn')} ${this.updateDate}`;
      }

      return dates;
    },
  },
  mounted() {
    const bodyStyles = window.getComputedStyle(document.body);
    const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoing-l-xl');
    this.imgTagSizes = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
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
  height: auto;
  object-fit: cover;
}

.c-news-entry__body {
  margin-top: var(--st-length-spacing-s);
}

.c-news-entry__dates {
  margin-top: var(--st-length-spacing-s);
  color: var(--st-color-news-date-foreground);
}

.c-news-entry__dates::first-letter {
  text-transform: uppercase;
}

@media (--sm-and-up) {
  .c-news-entry__image {
    max-height: min(50vw, 60vh);
  }
}

@media (--xl-and-up) {
  .c-news-entry__image {
    width: var(--st-breakpoing-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoing-l-xl) - var(--st-length-main-content-max-width)) / 2);
    max-height: 60vh;
  }
}
</style>
