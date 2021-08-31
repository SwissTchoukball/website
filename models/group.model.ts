import { ManyItems } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import Role from '~/models/role.model';
import { DirectusGroup, getTranslatedFields } from '~/plugins/directus';

export default class Group extends Model {
  static entity = 'groups';

  id!: number;
  name!: string;
  description!: string;
  roles!: any[];

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      description: this.string(null).nullable(),
      roles: this.hasMany(Role, 'group_id'),
    };
  }

  static async addManyFromDirectus(groupsResponse: ManyItems<DirectusGroup>) {
    if (!groupsResponse.data) {
      throw new Error('Error when retrieving groups');
    }

    const groups = groupsResponse.data.reduce((groups, group) => {
      // We discard entries that don't have mandatory data.
      if (!group.id || !group.name) {
        console.warn('Group missing mandatory data', { group });
        return groups;
      }

      const translatedFields = getTranslatedFields(group);

      return [
        ...groups,
        {
          id: group.id,
          name: translatedFields?.name || group.name,
          description: translatedFields?.description || group.description,
        },
      ];
    }, [] as any[]);

    await this.insert({ data: groups });
  }
}
