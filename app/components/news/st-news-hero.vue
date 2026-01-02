<template>
  <NuxtLink :to="newsLink" class="st-news-hero">
    <img
      v-if="newsEntry.main_image"
      class="st-news-hero__image"
      :alt="newsEntry.main_image.description"
      :src="imageFallbackSrc(newsEntry.main_image.id)"
      :srcset="imageSrcSet(newsEntry.main_image.id)"
      :sizes="imgTagSizes"
    />
    <div class="st-news-hero__title-fade"></div>
    <div class="st-news-hero__overlay">
      <st-domain-labels :domains="getDomainsFromList(newsEntry.domain_ids)" target-page-name="news" disable-links />
      <h3 class="st-news-hero__title">
        {{ newsEntry.title }}
      </h3>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';
import type { NewsEntry } from '~/components/news/st-news';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const localePath = useLocalePath();
const { getDomainsFromList } = useDomains();

const { newsEntry } = defineProps({
  newsEntry: {
    type: Object as PropType<NewsEntry>,
    required: true,
  },
});

const imgTagSizes = ref<string>('');

onMounted(() => {
  const bodyStyles = window.getComputedStyle(document.body);
  const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoint-l-xl');
  imgTagSizes.value = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
});

const newsLink = computed<string>(() => {
  return localePath(`/news/${newsEntry.id}-${newsEntry.slug}`);
});

const imageFallbackSrc = (assetId: string): string => {
  return getAssetURL(runtimeConfig.public.cmsURL, assetId, {
    width: appConfig.keyVisualSizes[0]!,
  });
};

const imageSrcSet = (assetId: string): string => {
  return getAssetSrcSet(runtimeConfig.public.cmsURL, assetId, {
    widths: appConfig.keyVisualSizes,
  });
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

.st-news-hero__image {
  display: block;
  width: 100%;
  object-fit: cover;
  background-image: linear-gradient(gray 100%, transparent 0);
  aspect-ratio: 3 / 2;
}

.st-news-hero {
  position: relative;
  display: block;
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
}

.st-news-hero__overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 var(--st-length-spacing-xs);
  margin-bottom: var(--st-length-spacing-xs);
  z-index: 0;
}

.st-news-hero__title {
  margin-top: var(--st-length-spacing-xs);
  color: var(--st-color-news-hero-title-foreground);
  font-weight: 900;
  font-size: 2em;
  text-wrap: balance;

  /* FIXME: Refactor the code below to not rely on on deprecated properties */

  /* PostCSS doesn't support adding prefix for line-clamp yet: https://github.com/postcss/autoprefixer/issues/1322 */
  /* stylelint-disable-next-line value-no-vendor-prefix */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* That's weird, but the -webkit- prefix works also for Firefox */
  /* stylelint-disable-next-line property-no-deprecated */
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.st-news-hero__title-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 9rem;
  background: linear-gradient(to bottom, rgb(0 0 0 / 0%), rgb(0 0 0 / 60%));
}

@media (--sm-and-up) {
  .st-news-hero__title {
    font-size: 2.25em;
  }

  .st-news-hero__title-fade {
    height: 10rem;
  }
}

@media (--md-and-up) {
  .st-news-hero__overlay {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-s);
  }

  .st-news-hero__title {
    font-size: 2.5em;
  }

  .st-news-hero__title-fade {
    height: 11rem;
  }
}

@media (--lg-and-up) {
  .st-news-hero__overlay {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-m);
  }

  .st-news-hero__title {
    font-size: 3em;
  }

  .st-news-hero__title-fade {
    height: 12rem;
  }
}

@media (--xl-and-up) {
  .st-news-hero {
    width: var(--st-breakpoint-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoint-l-xl) - var(--st-length-main-content-max-width)) / 2);
  }
}

@media (orientation: landscape) {
  .st-news-hero__image {
    aspect-ratio: 2 / 1;
  }

  @supports not (aspect-ratio: 2 / 1) {
    .st-news-hero__image::before {
      float: left;
      padding-top: 40%;
      content: '';
    }

    .st-news-hero__image::after {
      display: block;
      content: '';
      clear: both;
    }
  }
}
</style>
