import { ManyItems } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import Role from '~/models/role.model';
import { DirectusGroup, getTranslatedFields } from '~/plugins/directus';

export default class Group extends Model {
  static entity = 'groups';

  id!: number;
  name!: string;
  description?: string;
  slug!: string;
  roles!: any[];

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      description: this.string(null).nullable(),
      slug: this.string(null),
      roles: this.hasMany(Role, 'group_id'),
    };
  }

  static async addManyFromDirectus(groupsResponse: ManyItems<DirectusGroup>) {
    if (!groupsResponse.data) {
      throw new Error('Error when retrieving groups');
    }

    const groups = groupsResponse.data.reduce((groups, group) => {
      const translatedFields = getTranslatedFields(group);

      // We discard entries that don't have mandatory data.
      if (!group.id || !translatedFields?.name || !translatedFields?.slug) {
        console.warn('Group missing mandatory data', { group });
        return groups;
      }

      return [
        ...groups,
        {
          id: group.id,
          name: translatedFields.name,
          description: translatedFields?.description || '',
          slug: translatedFields?.slug,
        },
      ];
    }, [] as any[]);

    await this.insert({ data: groups });
  }
}
