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
      const translatedFields = getTranslatedFields(resourceType);

      // We discard entries that don't have mandatory data.
      if (!resourceType?.id || !translatedFields?.name) {
        console.warn('Resource type missing mandatory data', { resourceType });
        return resourceTypes;
      }

      return [
        ...resourceTypes,
        {
          id: resourceType.id,
          name: translatedFields.name,
        },
      ];
    }, [] as { id: number; name: string }[]);

    this.insert({ data: resourceTypes });
  }
}
