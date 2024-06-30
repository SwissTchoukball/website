import { defineStore } from 'pinia';
import type { LiveStream } from '~/plugins/08.cms-service';

export const useLiveStreamsStore = defineStore('live-streams', () => {
  const nuxtApp = useNuxtApp();
  const liveStreams = ref<LiveStream[]>([]);

  const loadLiveStreams = async () => {
    liveStreams.value = await nuxtApp.$cmsService.getLiveStreams();
  };

  return {
    liveStreams,
    loadLiveStreams,
  };
});
