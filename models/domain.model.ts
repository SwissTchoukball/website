import { ManyItems } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import { DirectusDomain, getTranslatedFields } from '~/plugins/directus';

export default class Domain extends Model {
  static entity = 'domains';

  id!: number;
  name!: string;

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
    };
  }

  static addManyFromDirectus(domainsResponse: ManyItems<DirectusDomain>) {
    if (!domainsResponse.data) {
      throw new Error('Error when retrieving domains');
    }

    const domains = domainsResponse.data.reduce((domains, domain) => {
      const translatedFields = getTranslatedFields(domain);

      // We discard entries that don't have mandatory data.
      if (!domain?.id || !translatedFields?.name) {
        console.warn('Domain missing mandatory data', { domain });
        return domains;
      }

      return [
        ...domains,
        {
          id: domain.id,
          name: translatedFields?.name,
        },
      ];
    }, [] as any[]);

    this.insert({ data: domains });
  }
}
