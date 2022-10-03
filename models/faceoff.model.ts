import { Model } from '@vuex-orm/core';
import Round from '~/models/round.model';
import Team from '~/models/team.model';
import Match from '~/models/match.model';

export default class Faceoff extends Model {
  static entity = 'faceoffs';

  id!: string;
  round_id!: string;
  round!: Round;
  first_team_id!: string;
  first_team!: Team;
  /**
   * Placeholder for when the first team is not defined yet
   */
  first_text!: string;
  second_team_id!: string;
  second_team!: Team;
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
      first_team_id: this.string(null).nullable(),
      first_team: this.belongsTo(Team, 'first_team_id'),
      first_text: this.string(null).nullable(),
      second_team_id: this.string(null).nullable(),
      second_team: this.belongsTo(Team, 'second_team_id'),
      second_text: this.string(null).nullable(),
      winner: this.string(null).nullable(),
      matches: this.hasMany(Match, 'faceoff_id'),
    };
  }
}
