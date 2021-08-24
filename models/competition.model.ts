import { Model } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';

export default class Competition extends Model {
  static entity = 'competitions';

  id!: string;
  name!: string;
  slug!: string;
  competition_editions!: CompetitionEdition[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      slug: this.string(null),
      competition_editions: this.hasMany(CompetitionEdition, 'competition_edition_id'),
    };
  }
}
