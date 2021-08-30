import { ManyItems } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import { DirectusResourceType, getTranslatedFields } from '~/plugins/directus';

export default class ResourceType extends Model {
  static entity = 'resource-types';

  id!: number;
  name!: string;

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
    };
  }

  static addManyFromDirectus(response: ManyItems<DirectusResourceType>) {
    if (!response.data) {
      throw new Error('Error when retrieving resource types');
    }

    const resourceTypes = response.data.reduce((resourceTypes, resourceType) => {
      // We discard entries that don't have mandatory data.
      if (!resourceType.id || !resourceType.name) {
        console.warn('Resource type missing mandatory data', { resourceType });
        return resourceTypes;
      }

      const translatedFields = getTranslatedFields(resourceType);

      return [
        ...resourceTypes,
        {
          id: resourceType.id,
          name: translatedFields?.name || resourceType.name,
        },
      ];
    }, [] as any[]);

    this.insert({ data: resourceTypes });
  }
}
