import { defineStore } from 'pinia';
import type { LiveStream } from '~/plugins/cms-service';

export const useLiveStreamsStore = defineStore('live-streams', () => {
  const liveStreams = ref<LiveStream[]>([]);

  const loadLiveStreams = async () => {
    liveStreams.value = await this.$cmsService.getLiveStreams();
  };

  return {
    liveStreams,
    loadLiveStreams,
  };
});
