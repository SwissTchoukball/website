import { Model } from '@vuex-orm/core';
import Group from '~/models/group.model';
import Person, { Gender } from '~/models/person.model';
// import RolePerson from '~/models/role-person.model';

export default class Role extends Model {
  static entity = 'roles';

  id!: number;
  name!: string;
  name_feminine?: string;
  name_masculine?: string;
  group!: Group;
  // holders!: Person[];

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      name_feminine: this.string(null).nullable(),
      name_masculine: this.string(null).nullable(),
      group_id: this.number(null),
      group: this.belongsTo(Group, 'group_id'),
      // holders: this.belongsToMany(Person, RolePerson, 'role_id', 'person_id'),
    };
  }

  getNameForPerson(person: Person) {
    if (person.gender === Gender.Female) {
      return this.name_feminine || this.name;
    } else if (person.gender === Gender.Male) {
      return this.name_masculine || this.name;
    }
    return this.name;
  }
}
