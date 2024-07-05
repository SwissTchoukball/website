<template>
  <div>
    <a v-for="liveStream of liveStreams" :key="liveStream.id" :href="liveStream.url" class="c-live-stream">
      <font-awesome-icon icon="circle-play" />
      <span>
        {{ $t('liveBanner.live') }}
        <template v-if="!hasBegun(liveStream)">
          <template v-if="beginsInMoreThan44Minutes(liveStream)">
            {{ $t('liveBanner.atTime', { time: $formatDate(new Date(liveStream.stream_start), 'p') }) }}
          </template>
          <template v-else>
            {{ $formatDateDistanceToNow(new Date(liveStream.stream_start)) }}
          </template>
        </template>
        :
        {{ liveStream.title }}
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { isPast, subMinutes } from 'date-fns';
import type { LiveStream } from '~/plugins/08.cms-service';

defineProps({
  liveStreams: {
    type: Array as PropType<LiveStream[]>,
    required: true,
  },
});

const hasBegun = (liveStream: LiveStream): boolean => {
  return isPast(new Date(liveStream.stream_start));
};

const beginsInMoreThan44Minutes = (liveStream: LiveStream): boolean => {
  const streamStartMinus44Minutes = subMinutes(new Date(liveStream.stream_start), 44);
  return !isPast(streamStartMinus44Minutes);
};
</script>

<style scoped>
.c-live-stream {
  display: flex;
  gap: var(--st-length-spacing-xs);
  align-items: center;
  padding: var(--st-length-spacing-xs) var(--st-length-main-content-side-padding);
  margin-top: var(--st-length-spacing-xxs);
  color: var(--st-color-live-stream-foreground);
  font-weight: bold;
  background-color: var(--st-color-live-stream-background);
  text-decoration: none;
}
</style>
