import { Model } from '@vuex-orm/core';
import Phase from '~/models/phase.model';
import Competition from '~/models/competition.model';
import Team from '~/models/team.model';
import { Season } from '~/store/state';

export default class CompetitionEdition extends Model {
  static entity = 'competition-editions';

  static primaryKey = 'leverade_id';

  leverade_id!: string;
  directus_id!: number;
  name!: string;
  gender!: string;
  season!: Season;
  competition!: Competition;
  phases!: Phase[];
  teams!: Team[];

  static fields() {
    return {
      leverade_id: this.string(null),
      directus_id: this.number(null),
      name: this.string(null),
      gender: this.string(null).nullable(),
      season: this.attr(null),
      competition_id: this.string(null),
      competition: this.belongsTo(Competition, 'competition_id'),
      phases: this.hasMany(Phase, 'competition_edition_id'),
      teams: this.hasMany(Team, 'competition_edition_id'),
    };
  }
}
