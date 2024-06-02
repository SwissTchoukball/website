import { defineStore } from 'pinia';
import type { Domain } from '~/plugins/cms-service';

export const useDomainsStore = defineStore('domains', () => {
  const domains = ref<Domain[]>([]);

  const loadDomains = async () => {
    domains.value = await this.$cmsService.getDomains();
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
