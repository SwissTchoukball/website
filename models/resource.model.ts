import { Model } from '@vuex-orm/core';
import { DirectusFile, DirectusResourceStatus } from '~/plugins/directus';
import Domain from '~/models/domain.model';
import DomainResource from '~/models/domain-resource.model';
import ResourceType from '~/models/resource-type.model';

export default class Resource extends Model {
  static entity = 'resources';

  id!: number;
  name!: string;
  file!: DirectusFile;
  link!: string;
  type!: ResourceType;
  domains!: Domain[];
  date!: string;
  status!: DirectusResourceStatus;

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      file: this.attr(null).nullable(),
      link: this.string(null).nullable(),
      type_id: this.number(null),
      type: this.belongsTo(ResourceType, 'type_id'),
      domains: this.belongsToMany(Domain, DomainResource, 'resource_id', 'domain_id'),
      status: this.string(null),
      date: this.string(null).nullable(),
    };
  }
}
