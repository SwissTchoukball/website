import { Model } from '@vuex-orm/core';

export default class DomainResource extends Model {
  static entity = 'domainResource';

  static primaryKey = ['domain_id', 'resource_id'];

  static fields() {
    return {
      domain_id: this.number(null),
      resource_id: this.number(null),
    };
  }
}
