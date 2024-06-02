import { isPast } from 'date-fns';
import type Faceoff from '~/models/faceoff.model';
import type Match from '~/models/match.model';
import type { LeveradeRound } from '~/plugins/07.leverade';
import type { parseLeveradeDate } from '~/utils/utils';

export default class Round {
  static entity = 'rounds';

  id: string;
  name: string;
  start_date: string;
  end_date: string;
  order: number;
  phase_id: string;
  faceoffs?: Faceoff[];
  matches?: Match[];

  constructor(round: LeveradeRound) {
    this.id = round.id;
    this.name = round.attributes.name;
    this.start_date = round.attributes.start_date;
    this.end_date = round.attributes.end_date;
    this.order = round.attributes.order;
    this.phase_id = round.relationships.group.data.id;
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

  get hasFinishedMatches(): boolean {
    return !!this.matches && this.matches.some((match) => match.finished && !match.rest);
  }
}
