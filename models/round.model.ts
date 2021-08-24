import { Model } from '@vuex-orm/core';
import Phase from '~/models/phase.model';
import Match from '~/models/match.model';

export default class Round extends Model {
  static entity = 'rounds';

  id!: string;
  name!: string;
  start_date!: string;
  end_date!: string;
  order!: number;
  phase!: Phase;
  matches!: Match[];

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      start_date: this.string(null),
      end_date: this.string(null),
      order: this.number(null),
      phase_id: this.string(null),
      phase: this.belongsTo(Phase, 'phase_id'),
      matches: this.hasMany(Match, 'round_id'),
    };
  }
}
