import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', () => {
  const nuxtApp = useNuxtApp();
  const config = ref<Record<string, string>>({});

  const loadConfig = async () => {
    const directusConfig = await nuxtApp.$cmsService.getConfig();
    config.value = directusConfig.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  return {
    config,
    loadConfig,
  };
});
