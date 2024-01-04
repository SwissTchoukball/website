import { Model } from '@vuex-orm/core';
import Round from '~/models/round.model';
import Team from '~/models/team.model';
import Match from '~/models/match.model';
import { LeveradeTeam } from '~/plugins/leverade';

export default class Faceoff extends Model {
  static entity = 'faceoffs';

  id!: string;
  round_id!: string;
  round!: Round;
  leverade_first_team!: LeveradeTeam;
  /**
   * Placeholder for when the first team is not defined yet
   */
  first_text!: string;
  leverade_second_team!: LeveradeTeam;
  /**
   * Placeholder for when the second team is not defined yet
   */
  second_text!: string;
  winner!: 'first' | 'second' | null;
  matches!: Match[];

  static fields() {
    return {
      id: this.string(null),
      round_id: this.string(null),
      round: this.belongsTo(Round, 'round_id'),
      leverade_first_team: this.attr(null),
      first_text: this.string(null).nullable(),
      leverade_second_team: this.attr(null),
      second_text: this.string(null).nullable(),
      winner: this.string(null).nullable(),
      matches: this.hasMany(Match, 'faceoff_id'),
    };
  }

  // TODO: Move the logic from the two following getters to the constructor when there will be one.
  get first_team(): Team | undefined {
    return this.leverade_first_team ? new Team(this.leverade_first_team) : undefined;
  }

  get second_team(): Team | undefined {
    return this.leverade_second_team ? new Team(this.leverade_second_team) : undefined;
  }
}
