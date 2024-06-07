<template>
  <NuxtLink :to="item.href" class="st-home-carousel-item">
    <img
      class="st-home-carousel-item__image"
      :alt="item.image.alt"
      :src="imageFallbackSrc(item.image.directusAssetId)"
      :srcset="imageSrcSet(item.image.directusAssetId)"
      :sizes="imgTagSizes"
    />
    <div class="st-home-carousel-item__title-fade"></div>
    <h3 class="st-home-carousel-item__title">
      {{ item.caption }}
    </h3>
  </NuxtLink>
</template>

<script setup lang="ts">
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();

export interface CarouselItem {
  image: {
    directusAssetId: string;
    alt?: string;
  };
  caption: string;
  href: string;
}

defineProps({
  item: {
    type: Object as PropType<CarouselItem>,
    required: true,
  },
});

const imgTagSizes = ref<string>('');

onMounted(() => {
  const bodyStyles = window.getComputedStyle(document.body);
  const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoint-l-xl');
  imgTagSizes.value = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
});

const imageFallbackSrc = (assetId: string): string => {
  return getAssetURL(runtimeConfig.public.cmsURL, assetId, {
    width: appConfig.keyVisualSizes[0],
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

.st-home-carousel-item__image {
  display: block;
  width: 100%;
  object-fit: cover;
  background-image: linear-gradient(gray 100%, transparent 0);
  aspect-ratio: 3 / 2;
}

.st-home-carousel-item {
  position: relative;
  display: block;
}

.st-home-carousel-item__title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 var(--st-length-spacing-xs);
  margin-bottom: var(--st-length-spacing-xs);
  color: var(--st-color-home-carousel-title-foreground);
  font-weight: 900;
  font-size: 2em;

  /* PostCSS doesn't support adding prefix for line-clamp yet: https://github.com/postcss/autoprefixer/issues/1322 */
  /* stylelint-disable-next-line value-no-vendor-prefix */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* That's weird, but the -webkit- prefix works also for Firefox */
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  z-index: 0;
}

.st-home-carousel-item__title-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 9rem;
  background: linear-gradient(to bottom, rgba(0 0 0 / 0%), rgba(0 0 0 / 60%));
}

@media (--sm-and-up) {
  .st-home-carousel-item__title {
    font-size: 2.25em;
  }

  .st-home-carousel-item__title-fade {
    height: 10rem;
  }
}

@media (--md-and-up) {
  .st-home-carousel-item__title {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-s);
    font-size: 2.5em;
  }

  .st-home-carousel-item__title-fade {
    height: 11rem;
  }
}

@media (--lg-and-up) {
  .st-home-carousel-item__title {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-m);
    font-size: 3em;
  }

  .st-home-carousel-item__title-fade {
    height: 12rem;
  }
}

@media (orientation: landscape) {
  .st-home-carousel-item__image {
    aspect-ratio: 2 / 1;
  }

  @supports not (aspect-ratio: 2 / 1) {
    .st-home-carousel-item__image::before {
      float: left;
      padding-top: 40%;
      content: '';
    }

    .st-home-carousel-item__image::after {
      display: block;
      content: '';
      clear: both;
    }
  }
}
</style>
