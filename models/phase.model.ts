import { Model } from '@vuex-orm/core';
import { LeveradeGroupType } from '~/plugins/leverade';
import CompetitionEdition from '~/models/competition-edition.model';
import Round from '~/models/round.model';

export default class Phase extends Model {
  static entity = 'phases';

  id!: string;
  name!: string;
  type!: LeveradeGroupType;
  group!: string;
  competition_edition!: CompetitionEdition;
  rounds!: Round[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      type: this.string(null),
      group: this.string(null),
      competition_edition_id: this.string(null),
      competition_edition: this.belongsTo(CompetitionEdition, 'competition_edition_id'),
      rounds: this.hasMany(Round, 'phase_id'),
    };
  }
}
