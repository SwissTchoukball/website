import type { Domain } from '~/plugins/08.cms-service';

export function useDomains() {
  const domainsStore = useDomainsStore();

  const getDomainsFromList = (domainsIds: number[]): Domain[] => {
    const domains: Domain[] = [];
    domainsIds.forEach((domainId) => {
      const domain = domainsStore.getDomainById(domainId);
      if (domain) {
        domains.push(domain);
      }
    });
    return domains;
  };

  return { getDomainsFromList };
}
