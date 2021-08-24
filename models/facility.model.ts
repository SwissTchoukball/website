import { Model } from '@vuex-orm/core';
import Match from './match.model';

export default class Facility extends Model {
  static entity = 'facilities';

  id!: string;
  name!: string;
  latitude!: number;
  longitude!: number;
  address!: string;
  postal_code!: string;
  city!: string;
  matches!: Match[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      latitude: this.number(null).nullable(),
      longitude: this.number(null).nullable(),
      address: this.string(null).nullable(),
      postal_code: this.string(null).nullable(),
      city: this.string(null).nullable(),
      matches: this.hasMany(Match, 'facility_id'),
    };
  }
}
