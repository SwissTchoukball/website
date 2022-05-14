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
  second_team_id!: string;
  second_team!: Team;
  winner!: 'first' | 'second' | null;
  matches!: Match[];

  static fields() {
    return {
      id: this.string(null),
      round_id: this.string(null),
      round: this.belongsTo(Round, 'round_id'),
      first_team_id: this.string(null).nullable(),
      first_team: this.belongsTo(Team, 'first_team_id'),
      second_team_id: this.string(null).nullable(),
      second_team: this.belongsTo(Team, 'second_team_id'),
      winner: this.string(null).nullable(),
      matches: this.hasMany(Match, 'faceoff_id'),
    };
  }
}
