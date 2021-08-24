import { Model } from '@vuex-orm/core';
import Phase from '~/models/phase.model';
import Competition from '~/models/competition.model';
import Team from '~/models/team.model';

export default class CompetitionEdition extends Model {
  static entity = 'competition-editions';

  id!: string;
  name!: string;
  gender!: string;
  phases!: Phase[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      gender: this.string(null),
      season: this.string(null),
      competition_id: this.string(null),
      competition: this.belongsTo(Competition, 'competition_id'),
      phases: this.hasMany(Phase, 'competition_edition_id'),
      teams: this.hasMany(Team, 'competition_edition_id'),
    };
  }
}
