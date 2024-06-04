<template>
  <a :href="`https://www.flickr.com/photos/swisstchoukball/${photo.id}`">
    <img :src="photo.url_m" :alt="photo.title" :title="photo.title" loading="lazy" class="c-flickr-photo" />
  </a>
</template>

<script setup lang="ts">
import type { FlickrPhoto } from '~/plugins/05.flickr';

defineProps({
  photo: {
    type: Object as PropType<FlickrPhoto>,
    required: true,
  },
});
</script>

<style scoped>
.c-flickr-photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
</style>
