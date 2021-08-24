import { Model } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';
import Match from '~/models/match.model';

export default class Team extends Model {
  static entity = 'teams';

  id!: string;
  name!: string;
  avatarKey!: string;

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      avatarKey: this.string(null),
      competition_edition_id: this.string(null),
      competition_edition: this.belongsTo(CompetitionEdition, 'competition_edition_id'),
      home_matches: this.hasMany(Match, 'home_team_id'),
      away_matches: this.hasMany(Match, 'away_team_id'),
    };
  }
}
