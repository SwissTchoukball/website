import { defineStore } from 'pinia';
import type { ResourceType } from '~/plugins/08.cms-service';

export const useResourcesStore = defineStore('resources', () => {
  const nuxtApp = useNuxtApp();
  const resourceTypes = ref<ResourceType[]>([]);

  const loadResourceTypes = async () => {
    resourceTypes.value = await nuxtApp.$cmsService.getResourceTypes();
  };

  return {
    resourceTypes,
    loadResourceTypes,
  };
});
