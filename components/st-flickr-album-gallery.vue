<template>
  <ul class="u-unstyled-list c-flickr-album-gallery">
    <li v-for="photo of photos" :key="photo.id" class="c-flickr-album-gallery__photo">
      <st-flickr-photo :photo="photo" />
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FlickrPhoto } from '~/plugins/flickr';

export default defineComponent({
  props: {
    photos: {
      type: Array as PropType<FlickrPhoto[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.c-flickr-album-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(333px, 1fr));
  gap: var(--st-length-spacing-xxs);
}

.c-flickr-album-gallery__photo >>> img {
  display: block;
}
</style>
