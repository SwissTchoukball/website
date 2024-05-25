<template>
  <ul class="c-news-list u-unstyled-list">
    <li v-for="newsEntry of news" :key="`news-${newsEntry.id}`" class="c-news-list__entry">
      <nuxt-link
        class="c-news-list__image-container"
        :class="{ 'c-news-list__image-container--no-image': !newsEntry.main_image }"
        :to="getNewsLink(newsEntry)"
      >
        <img
          v-if="newsEntry.main_image"
          class="c-news-list__image"
          :alt="newsEntry.main_image.description"
          :src="mainImageFallbackSrc(newsEntry.main_image.id)"
          :srcset="mainImageSrcSet(newsEntry.main_image.id)"
          sizes="
            (min-width: 1400px) 326px,
            (min-width: 1100px) 30vw,
            (min-width: 700px) 45vw,
            96vw
          "
        />
        <div v-else class="c-news-list__image c-news-list__image--placeholder">
          <fa-icon icon="newspaper" class="c-news-list__placeholder-icon" />
        </div>
      </nuxt-link>
      <st-domain-labels :domains="getDomains(newsEntry)" target-page-name="news" class="c-news-list__domains" />
      <h3 class="c-news-list__title t-headline-2">
        <nuxt-link :to="getNewsLink(newsEntry)"> {{ newsEntry.title }} </nuxt-link>
      </h3>
      <time :datetime="getNewsCreationDateISO(newsEntry)" class="c-news-list__date">
        {{ getNewsCreationDate(newsEntry) }}
      </time>
    </li>
    <li v-for="index in amountSpacerProducts" :key="`spacer-${index}`"></li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { NewsEntry } from '~/components/news/st-news';
import { Domain } from '~/plugins/cms-service';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';

const MAX_NEWS_PER_ROW = 4;

export default defineComponent({
  props: {
    news: {
      type: Array as PropType<NewsEntry[]>,
      required: true,
    },
  },
  computed: {
    /**
     * The amount of spacer products to insert in the grid to ensure a good looking result with few elements.
     *
     * See comment in the CSS class `c-product-list` for details.
     */
    amountSpacerProducts(): number {
      if (this.news.length >= MAX_NEWS_PER_ROW) {
        return 0;
      } else {
        return MAX_NEWS_PER_ROW - this.news.length;
      }
    },
  },
  methods: {
    getNewsLink(newsEntry: NewsEntry) {
      let newsLink = `/news/${newsEntry.id}`;
      if (newsEntry.slug) {
        newsLink += `-${newsEntry.slug}`;
      }
      return this.localePath(newsLink);
    },
    getNewsCreationDate(newsEntry: NewsEntry): string {
      return this.$formatDate(new Date(newsEntry.date_created), 'PPP');
    },
    getNewsCreationDateISO(newsEntry: NewsEntry): string {
      return this.$formatDate(new Date(newsEntry.date_created), 'yyyy-MM-dd');
    },
    mainImageFallbackSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    mainImageSrcSet(assetId: string): string {
      return getAssetSrcSet(this.$config.cmsURL, assetId, {
        widths: this.$config.keyVisualSizes,
      });
    },
    getDomains(newsEntry: NewsEntry): Domain[] {
      return newsEntry.domain_ids.map((domainId) => this.$store.getters.getDomainById(domainId));
    },
  },
});
</script>

<style scoped>
.c-news-list {
  display: block;
}

.c-news-list__entry {
  width: 100%;
  margin-bottom: var(--st-length-spacing-m);
}

.c-news-list__image-container {
  display: block;
  width: 100%;
  padding-top: 56%;
  background-color: var(--st-color-news-image-background);
  position: relative;
  overflow: hidden;
}

.c-news-list__image-container--no-image {
  display: none;
}

.c-news-list__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.c-news-list__image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-news-list__placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: var(--st-color-news-image-foreground);
}

.c-news-list__domains {
  margin-top: var(--st-length-spacing-xs);
}

.c-news-list__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-news-list__title a {
  color: var(--st-color-text);
}

.c-news-list__date {
  display: block;
  font-size: 0.8rem;
  color: var(--st-color-news-date-foreground);
  padding-top: var(--st-length-spacing-xxs);
}

@media (--sm-and-up) {
  .c-news-list {
    /*
     * The grid auto-fit layout allows us to have the behaviour we want:
     * - cards with a minimum width
     * - cards can grow to take the space available
     * - fit as many cards as possible in a single row, while still respecting the minimum width
     *
     * Following that logic, if there are only a few (i.e. 1 to 3) cards, they will take the full width available.
     * However, with a large viewport, this could result in gigantic cards.
     * Setting a max-width is not the solution as there isn't a value for it that would fit all the use cases.
     * That's why we're adding *spacer* products to have minimum 4 items in the grid.
     */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(274px, 1fr));
    gap: var(--st-length-spacing-m) var(--st-length-spacing-s);
  }

  .c-news-list__entry {
    margin-bottom: 0;
  }

  .c-news-list__image-container--no-image {
    display: block;
  }
}

@media (--md-and-up) {
  .c-news-list {
    grid-template-columns: repeat(auto-fit, minmax(325px, 1fr));
  }
}
</style>
