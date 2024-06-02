<template>
  <div class="st-home-carousel">
    <vue-slick-carousel v-if="items.length > 0" v-bind="settings">
      <nuxt-link
        v-for="(item, index) in items"
        :key="`carousel-item-${index}`"
        :to="item.href"
        class="st-home-carousel__item"
      >
        <img
          class="st-home-carousel__image"
          :alt="item.image.alt"
          :src="imageFallbackSrc(item.image.directusAssetId)"
          :srcset="imageSrcSet(item.image.directusAssetId)"
          :sizes="imgTagSizes"
        />
        <div class="st-home-carousel__title-fade"></div>
        <h3 class="st-home-carousel__title">
          {{ item.caption }}
        </h3>
      </nuxt-link>
    </vue-slick-carousel>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';

export interface CarouselItem {
  image: {
    directusAssetId: string;
    alt?: string;
  };
  caption: string;
  href: string;
}

// TODO: Switch to Swiper when we'll be using Vue 3.
//       https://swiperjs.com/vue
export default defineComponent({
  props: {
    items: {
      type: Array as PropType<CarouselItem[]>,
      required: true,
    },
  },
  data() {
    return {
      settings: {
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        dots: true,
        arrows: false,
      },
      imgTagSizes: '',
    };
  },
  mounted() {
    const bodyStyles = window.getComputedStyle(document.body);
    const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoint-l-xl');
    this.imgTagSizes = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
  },
  methods: {
    imageFallbackSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    imageSrcSet(assetId: string): string {
      return getAssetSrcSet(this.$config.cmsURL, assetId, {
        widths: this.$config.keyVisualSizes,
      });
    },
  },
});
</script>

<style scoped>
.st-home-carousel {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
}

.st-home-carousel__image {
  display: block;
  width: 100%;
  object-fit: cover;
  background-image: linear-gradient(gray 100%, transparent 0);
  aspect-ratio: 3 / 2;
}

.st-home-carousel__item {
  position: relative;
  display: block;
}

.st-home-carousel__title {
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

.st-home-carousel__title-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 9rem;
  background: linear-gradient(to bottom, rgba(0 0 0 / 0%), rgba(0 0 0 / 60%));
}

@media (--sm-and-up) {
  .st-home-carousel__title {
    font-size: 2.25em;
  }

  .st-home-carousel__title-fade {
    height: 10rem;
  }
}

@media (--md-and-up) {
  .st-home-carousel__title {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-s);
    font-size: 2.5em;
  }

  .st-home-carousel__title-fade {
    height: 11rem;
  }
}

@media (--lg-and-up) {
  .st-home-carousel__title {
    padding: var(--st-length-spacing-xs) var(--st-length-spacing-m);
    font-size: 3em;
  }

  .st-home-carousel__title-fade {
    height: 12rem;
  }
}

@media (--xl-and-up) {
  .st-home-carousel {
    width: var(--st-breakpoint-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoint-l-xl) - var(--st-length-main-content-max-width)) / 2);
  }
}

@media (orientation: landscape) {
  .st-home-carousel__image {
    aspect-ratio: 2 / 1;
  }

  @supports not (aspect-ratio: 2 / 1) {
    .st-home-carousel__image::before {
      float: left;
      padding-top: 40%;
      content: '';
    }

    .st-home-carousel__image::after {
      display: block;
      content: '';
      clear: both;
    }
  }
}
</style>

<style>
/* Style based on the theme from the library. I didn't import the full theme as we just want to style the dots. */
.slick-dotted.slick-slider {
  margin-bottom: 30px;
}

.slick-dots {
  width: 100%;
  padding: 0;
  margin: 0;
  margin-top: var(--st-length-spacing-xs);
  list-style: none;
  display: flex !important; /* Overriding inline style set by library. This possibly disables the `dots` settings from the library */
  justify-content: center;
  align-items: center;
}

.slick-dots li {
  margin: 0 calc(var(--st-length-spacing-xs) / 2);
  padding: 0;
  font-size: 0;
}

.slick-dots li button {
  background-color: var(--st-color-home-carousel-dot);
  border-radius: 50%;
  font-size: 0;
  line-height: 0;
  margin: 0;
  padding: 0;
  height: 10px;
  width: 10px;
  border: 1px solid transparent;
  transition: background-color 0.3s ease;
}

.slick-dots li.slick-active button {
  background-color: var(--st-color-home-carousel-dot-active);
  width: 12px;
  height: 12px;
  border: none;
}
</style>
