<template>
  <div class="st-home-carousel">
    <client-only>
      <swiper-container
        class="st-home-carousel__swiper"
        css-mode="true"
        :pagination="{ clickable: true }"
        :autoplay="{ delay: 5000, pauseOnMouseEnter: true }"
        rewind="true"
      >
        <swiper-slide v-for="(item, index) in items" :key="`carousel-item-${index}`">
          <st-home-carousel-item :item="item" />
        </swiper-slide>
      </swiper-container>
      <template #fallback>
        <st-home-carousel-item :item="items[0]" class="st-home-carousel__item-fallback" />
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { CarouselItem } from './st-home-carousel-item.vue';

defineProps({
  items: {
    type: Array as PropType<CarouselItem[]>,
    required: true,
  },
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.st-home-carousel {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
}

.st-home-carousel__swiper::part(pagination) {
  position: static;
  margin-top: var(--st-length-spacing-xs);
}

.st-home-carousel__swiper::part(bullet) {
  background-color: var(--st-color-home-carousel-dot);
  opacity: 1;
  width: 10px;
  height: 10px;
  margin: 0 calc(var(--st-length-spacing-xs) / 2);
  transition: background-color 0.3s ease;
}

.st-home-carousel__swiper::part(bullet-active) {
  background-color: var(--st-color-home-carousel-dot-active);
  width: 12px;
  height: 12px;
  margin: 0 calc(var(--st-length-spacing-xs) / 2);
  transition: background-color 0.3s ease;
}

.st-home-carousel__item-fallback {
  margin-bottom: var(--st-length-spacing-xs);
}

@media (--xl-and-up) {
  .st-home-carousel {
    width: var(--st-breakpoint-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoint-l-xl) - var(--st-length-main-content-max-width)) / 2);
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
