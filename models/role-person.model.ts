import { Model } from '@vuex-orm/core';

export default class RolePerson extends Model {
  static entity = 'rolePerson';

  static primaryKey = ['role_id', 'person_id'];

  static fields() {
    return {
      role_id: this.number(null),
      person_id: this.number(null),
      main: this.boolean(false),
    };
  }
}
