<template>
  <div>
    <a v-for="liveStream of liveStreams" :key="liveStream.id" :href="liveStream.url" class="c-live-stream">
      <fa-icon icon="circle-play" />
      <span>
        {{ $t('liveBanner.live') }}
        <template v-if="!hasBegun(liveStream)">
          {{ $formatDateDistanceToNow(new Date(liveStream.stream_start)) }}
        </template>
        :
        {{ liveStream.title }}
      </span>
    </a>
  </div>
</template>

<script lang="ts">
import { isPast } from 'date-fns';
import Vue, { PropType } from 'vue';
import { LiveStream } from '~/plugins/cms-service';

export default Vue.extend({
  props: {
    liveStreams: {
      type: Array as PropType<LiveStream[]>,
      required: true,
    },
  },
  methods: {
    hasBegun: (liveStream: LiveStream) => {
      return isPast(new Date(liveStream.stream_start));
    },
  },
});
</script>

<style scoped>
.c-live-stream {
  display: flex;
  gap: var(--st-length-spacing-xs);
  align-items: center;
  padding: var(--st-length-spacing-xs) var(--st-length-main-content-side-padding);
  color: var(--st-color-live-stream-foreground);
  font-weight: bold;
  background-color: var(--st-color-live-stream-background);
  text-decoration: none;
}
</style>
