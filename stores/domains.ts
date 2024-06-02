import { defineStore } from 'pinia';
import type { Domain } from '~/plugins/08.cms-service';

export const useDomainsStore = defineStore('domains', () => {
  const nuxtApp = useNuxtApp();
  const domains = ref<Domain[]>([]);

  const loadDomains = async () => {
    domains.value = await nuxtApp.$cmsService.getDomains();
  };

  const getDomainById = (id: number): Domain | undefined => {
    return domains.value.find((domain: Domain) => domain.id === id);
  };

  return {
    domains,
    loadDomains,
    getDomainById,
  };
});
