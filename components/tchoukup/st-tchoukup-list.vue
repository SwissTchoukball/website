<template>
  <ul class="c-tchoukup-list u-unstyled-list">
    <li v-for="issue of issues" :key="`tchoukup-${issue.id}`" class="c-tchoukup-list__entry">
      <a class="c-tchoukup-list__image-container" :href="getIssueDownloadLink(issue)">
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
        <a :href="getIssueDownloadLink(issue)">
          {{ $t('tchoukup.no') }} {{ issue.number }} – {{ getReleaseMonth(issue) }}
        </a>
      </h3>
    </li>
    <li v-for="index in amountSpacerProducts" :key="`spacer-${index}`"></li>
  </ul>
</template>

<script setup lang="ts">
import type { Tchoukup } from '~/components/tchoukup/st-tchoukup';
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const { $formatDate } = useNuxtApp();

const MAX_NEWS_PER_ROW = 4;

const props = defineProps({
  issues: {
    type: Array as PropType<Tchoukup[]>,
    required: true,
  },
});

/**
 * The amount of spacer products to insert in the grid to ensure a good looking result with few elements.
 *
 * See comment in the CSS class `c-product-list` for details.
 */
const amountSpacerProducts = computed<number>(() => {
  if (props.issues.length >= MAX_NEWS_PER_ROW) {
    return 0;
  } else {
    return MAX_NEWS_PER_ROW - props.issues.length;
  }
});

const getIssueDownloadLink = (issue: Tchoukup): string | undefined => {
  if (issue.file) {
    return `${runtimeConfig.public.cmsURL}/assets/${issue.file.id}?download`;
  } else {
    return '#';
  }
};

const getReleaseMonth = (issue: Tchoukup): string => {
  if (!issue.releaseDate) {
    return '';
  }
  return $formatDate(new Date(issue.releaseDate), 'MMMM yyyy');
};

const coverFallbackSrc = (assetId: string): string => {
  return getAssetURL(runtimeConfig.public.cmsURL, assetId, {
    width: appConfig.keyVisualSizes[0],
  });
};

const coverSrcSet = (assetId: string): string => {
  return getAssetSrcSet(runtimeConfig.public.cmsURL, assetId, {
    widths: appConfig.keyVisualSizes,
  });
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

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
    gap: var(--st-length-spacing-m) var(--st-length-spacing-s);
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
