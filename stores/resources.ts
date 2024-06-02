import { defineStore } from 'pinia';
import type { ResourceType } from '~/plugins/cms-service';

export const useResourcesStore = defineStore('resources', () => {
  const resourcesTypes = ref<ResourceType[]>([]);

  const loadResourceTypes = async () => {
    resourcesTypes.value = await this.$cmsService.getResourceTypes();
  };

  return {
    resourcesTypes,
    loadResourceTypes,
  };
});
