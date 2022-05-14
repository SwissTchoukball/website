import { Model } from '@vuex-orm/core';
import { isPast } from 'date-fns';
import Phase from '~/models/phase.model';
import Faceoff from '~/models/faceoff.model';
import Match from '~/models/match.model';
import { parseLeveradeDate } from '~/utils/utils';

export default class Round extends Model {
  static entity = 'rounds';

  id!: string;
  name!: string;
  start_date!: string;
  end_date!: string;
  order!: number;
  phase!: Phase;
  faceoffs!: Faceoff[];
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
      faceoffs: this.hasMany(Faceoff, 'round_id'),
      matches: this.hasMany(Match, 'round_id'),
    };
  }

  get parsedStartDate() {
    if (this.start_date) {
      return parseLeveradeDate(this.start_date);
    }
  }

  get isPast(): boolean {
    if (!this.parsedStartDate) {
      return false;
    }
    return isPast(this.parsedStartDate);
  }
}
