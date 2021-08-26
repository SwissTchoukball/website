import { Model } from '@vuex-orm/core';

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
}
