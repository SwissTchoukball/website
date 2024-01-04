import { Model } from '@vuex-orm/core';
import Round from '~/models/round.model';
import Faceoff from '~/models/faceoff.model';
import Team from '~/models/team.model';
import { parseLeveradeDate } from '~/utils/utils';
import { LeveradeTeam } from '~/plugins/leverade';

export interface Facility {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  postal_code: string;
  city: string;
}

export default class Match extends Model {
  static entity = 'matches';

  id!: string;
  datetime!: string | null;
  round_id!: string;
  round!: Round;
  faceoff_id!: string;
  faceoff!: Faceoff;
  leverade_home_team!: LeveradeTeam;
  home_team_score!: number;
  leverade_away_team!: LeveradeTeam;
  away_team_score!: number;
  periods!: {
    name?: string;
    order: number;
    home_team_score?: number;
    away_team_score?: number;
  }[];

  referees!: {
    first_name: string;
    last_name: string;
    gender: 'male' | 'female';
  }[];

  facility!: Facility | null;

  finished!: boolean;
  canceled!: boolean;
  rest!: boolean;

  // Non-Leverade fields:
  flickr_photoset_id?: string;

  static fields() {
    return {
      id: this.string(null),
      datetime: this.string(null).nullable(),
      round_id: this.string(null),
      round: this.belongsTo(Round, 'round_id'),
      faceoff_id: this.string(null).nullable(),
      faceoff: this.belongsTo(Faceoff, 'faceoff_id'),
      leverade_home_team: this.attr(null),
      home_team_score: this.number(null).nullable(),
      leverade_away_team: this.attr(null),
      away_team_score: this.number(null).nullable(),
      periods: this.attr([]),
      referees: this.attr([]),
      facility: this.attr(null),
      finished: this.boolean(false),
      canceled: this.boolean(false),
      rest: this.boolean(false),

      // Non-Leverade fields:
      flickr_photoset_id: this.string(null).nullable(),
    };
  }

  parsedDate() {
    if (this.datetime) {
      return parseLeveradeDate(this.datetime);
    }
  }

  // TODO: Move the logic from the two following getters to the constructor when there will be one.
  get home_team(): Team | undefined {
    return this.leverade_home_team ? new Team(this.leverade_home_team) : undefined;
  }

  get away_team(): Team | undefined {
    return this.leverade_away_team ? new Team(this.leverade_away_team) : undefined;
  }

  get homeTeamName(): string {
    if (this.home_team) {
      return this.home_team.name;
    } else if (this.faceoff?.first_text) {
      return this.faceoff.first_text;
    }
    return '';
  }

  get awayTeamName(): string {
    if (this.away_team) {
      return this.away_team.name;
    } else if (this.faceoff?.second_text) {
      return this.faceoff.second_text;
    }
    return '';
  }

  static getFutureMatches(phaseId: string): Match[] {
    return (
      Match.query()
        .with('home_team')
        .with('away_team')
        .with('facility')
        .with('faceoff')
        .with('round', (query) => query.with('phase', (queryP) => queryP.where('id', phaseId)))
        .where('datetime', (datetime: string) => datetime >= new Date().toISOString().substring(0, 10))
        .orderBy('datetime')
        .get()
        // Somehow, this query retrieves some matches from other phases, without including the phase.
        // We filter those out here. FIXME: Find a cleaner way to fix this.
        .filter((match) => match.round.phase)
    );
  }
}
