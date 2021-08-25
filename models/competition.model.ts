import { Model } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';

export default class Competition extends Model {
  static entity = 'competitions';

  id!: string;
  name!: string;
  slug!: string;
  editions!: CompetitionEdition[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      slug: this.string(null),
      editions: this.hasMany(CompetitionEdition, 'competition_id'),
    };
  }
}
