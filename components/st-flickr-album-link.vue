<template>
  <a :href="`https://www.flickr.com/photos/swisstchoukball/albums/${album.id}`" class="c-flickr-album-link">
    <div class="c-flickr-album-link__pile-effect"></div>
    <img
      :src="album.primary_photo_extras.url_m"
      :alt="album.title._content"
      :title="album.title._content"
      loading="lazy"
      class="c-flickr-album-link__photo"
    />
    <div class="c-flickr-album-link__overlay"></div>
    <div class="c-flickr-album-link__caption">
      {{ album.title._content }}
    </div>
  </a>
</template>

<script setup lang="ts">
import type { FlickrPhotoset } from '~/plugins/05.flickr';

defineProps({
  album: {
    type: Object as PropType<FlickrPhotoset>,
    required: true,
  },
});
</script>

<style scoped>
.c-flickr-album-link {
  display: inline-block;
  text-decoration: none;
  color: var(--st-color-text);
  position: relative;
}

.c-flickr-album-link__pile-effect,
.c-flickr-album-link__pile-effect::before {
  content: '';
  width: 96%;
  position: absolute;
  top: -3px;
  left: 2%;
  border-bottom: 1px solid var(--st-color-photo-pile-effect-line);
}

.c-flickr-album-link__photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.c-flickr-album-link__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0 0 0 / 90%) 0, transparent 50%, transparent);
}

.c-flickr-album-link__caption {
  text-align: left;
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
  right: 0.5em;
  color: var(--st-color-photo-caption-text);
  text-shadow: 0 1px 1px #000;
}
</style>
