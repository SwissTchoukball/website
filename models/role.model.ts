import { PartialItem } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import Group from '~/models/group.model';
import Person, { Gender } from '~/models/person.model';
import { DirectusRole, getTranslatedFields } from '~/plugins/directus';
import RolePerson from '~/models/role-person.model';

export default class Role extends Model {
  static entity = 'roles';

  id!: number;
  name!: string;
  name_feminine?: string;
  name_masculine?: string;
  group?: Group;
  holders!: Person[];
  pivot?: {
    main?: boolean;
  };

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      name_feminine: this.string(null).nullable(),
      name_masculine: this.string(null).nullable(),
      group_id: this.number(null).nullable(),
      group: this.belongsTo(Group, 'group_id'),
      holders: this.belongsToMany(Person, RolePerson, 'role_id', 'person_id'),
    };
  }

  get nameForHolders(): string {
    if (this.name_feminine && this.holders.every((holder) => holder.gender === Gender.Female)) {
      return this.name_feminine;
    }
    if (this.name_masculine && this.holders.every((holder) => holder.gender === Gender.Male)) {
      return this.name_masculine;
    }
    return this.name;
  }

  getNameForPerson(person: Person) {
    if (person.gender === Gender.Female) {
      return this.name_feminine || this.name;
    } else if (person.gender === Gender.Male) {
      return this.name_masculine || this.name;
    }
    return this.name;
  }

  static addManyFromDirectus(directusRoles: PartialItem<DirectusRole>[]) {
    const rolesData = directusRoles.reduce((roles, role) => {
      if (!role || !role.id) {
        return roles;
      }

      const translatedRoleFields = getTranslatedFields(role);

      if (!translatedRoleFields?.name) {
        return roles;
      }

      const translatedGroupFields = role.group ? getTranslatedFields(role.group) : {};

      return [
        ...roles,
        {
          id: role.id,
          name: translatedRoleFields.name,
          name_feminine: translatedRoleFields.name_feminine,
          name_masculine: translatedRoleFields.name_masculine,
          group: role.group
            ? {
                id: role.group.id,
                name: translatedGroupFields?.name,
              }
            : null,
          holders: role.holders ? role.holders.map((holder) => holder?.people_id).filter((holder) => holder) : [],
        },
      ] as Role[];
    }, [] as Role[]);
    this.insertOrUpdate({ data: rolesData });
  }
}
