<template>
  <ul class="c-tchoukup-list u-unstyled-list">
    <li v-for="issue of issues" :key="`tchoukup-${issue.id}`" class="c-tchoukup-list__entry">
      <a class="c-tchoukup-list__image-container" :href="getIssueDownloadLink(issue)" :download="download">
        <img
          v-if="issue.cover"
          class="c-tchoukup-list__image"
          :alt="issue.cover.description"
          :src="coverFallbackSrc(issue.cover.id)"
          :srcset="coverSrcSet(issue.cover.id)"
          sizes="
            (min-width: 1400px) 326px,
            (min-width: 1100px) 30vw,
            (min-width: 700px) 45vw,
            96vw
          "
        />
      </a>
      <h3 class="c-tchoukup-list__title t-headline-3">
        <a :href="getIssueDownloadLink(issue)" :download="download">
          {{ $t('tchoukup.no') }} {{ issue.number }} – {{ getReleaseMonth(issue) }}
        </a>
      </h3>
    </li>
    <li v-for="index in amountSpacerProducts" :key="`spacer-${index}`"></li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Tchoukup } from '~/components/tchoukup/st-tchoukup';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';

const MAX_NEWS_PER_ROW = 4;

export default Vue.extend({
  props: {
    issues: {
      type: Array as PropType<Tchoukup[]>,
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
      if (this.issues.length >= MAX_NEWS_PER_ROW) {
        return 0;
      } else {
        return MAX_NEWS_PER_ROW - this.issues.length;
      }
    },
  },
  methods: {
    getIssueDownloadLink(issue: Tchoukup): string | undefined {
      if (issue.file) {
        return `${this.$config.cmsURL}/assets/${issue.file.id}?download`;
      } else {
        return '#';
      }
    },
    getReleaseMonth(issue: Tchoukup): string {
      if (!issue.releaseDate) {
        return '';
      }
      return this.$formatDate(new Date(issue.releaseDate), 'MMMM yyyy');
    },
    coverFallbackSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    coverSrcSet(assetId: string): string {
      return getAssetSrcSet(this.$config.cmsURL, assetId, {
        widths: this.$config.keyVisualSizes,
      });
    },
  },
});
</script>

<style scoped>
.c-tchoukup-list {
  display: block;
}

.c-tchoukup-list__entry {
  width: 100%;
  margin-bottom: var(--st-length-spacing-l);
}

.c-tchoukup-list__image-container {
  display: block;
  width: 100%;
  padding-top: 141%;
  background-color: var(--st-color-news-image-background);
  position: relative;
  overflow: hidden;
}

.c-tchoukup-list__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid var(--st-color-tchoukup-border);
}

.c-tchoukup-list__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-tchoukup-list__title a {
  color: var(--st-color-text);
}

@media (--sm-and-up) {
  .c-tchoukup-list {
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
    column-gap: var(--st-length-spacing-s);
    row-gap: var(--st-length-spacing-m);
  }

  .c-tchoukup-list__entry {
    margin-bottom: 0;
  }

  .c-tchoukup-list__image-container--no-image {
    display: block;
  }
}

@media (--md-and-up) {
  .c-tchoukup-list {
    grid-template-columns: repeat(auto-fit, minmax(325px, 1fr));
  }
}
</style>
