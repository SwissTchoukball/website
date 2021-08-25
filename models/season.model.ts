import { Model } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';

export default class Season extends Model {
  static entity = 'seasons';

  id!: number;
  leverade_id!: string;
  name!: string;
  slug!: string;
  competition_editions!: CompetitionEdition[];

  static fields() {
    return {
      id: this.number(null),
      leverade_id: this.string(null),
      name: this.string(null),
      slug: this.string(null).nullable(),
      competition_editions: this.hasMany(CompetitionEdition, 'season_id'),
    };
  }
}
