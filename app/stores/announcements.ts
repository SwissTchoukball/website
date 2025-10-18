import { defineStore } from 'pinia';
import type { Announcement } from '~/plugins/08.cms-service';

export const useAnnouncementsStore = defineStore('announcements', () => {
  const nuxtApp = useNuxtApp();
  const announcements = ref<Announcement[]>([]);

  const loadAnnouncements = async () => {
    announcements.value = await nuxtApp.$cmsService.getAnnouncements();
  };

  return {
    announcements,
    loadAnnouncements,
  };
});
