import { defineStore } from 'pinia';
import type { DirectusFile } from '@directus/sdk';
import type { DirectusSchema } from '~/plugins/06.directus';

export interface EventType {
  id: number;
  name: string;
  name_plural: string;
  image?: DirectusFile<DirectusSchema>;
}

export interface EventTypes {
  [id: number]: EventType;
}

export const useEventsStore = defineStore('events', () => {
  const nuxtApp = useNuxtApp();

  const eventTypes = ref<EventTypes>();

  const loadEventTypes = async () => {
    eventTypes.value = await nuxtApp.$cmsService.getEventTypes();
  };

  return {
    eventTypes,
    loadEventTypes,
  };
});
