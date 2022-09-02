import { Model } from '@vuex-orm/core';
import Phase from '~/models/phase.model';
import Competition from '~/models/competition.model';
import Team from '~/models/team.model';
import Season from '~/models/season.model';

export default class CompetitionEdition extends Model {
  static entity = 'competition-editions';

  static primaryKey = 'leverade_id';

  leverade_id!: string;
  directus_id!: number;
  name!: string;
  gender!: string;
  season!: Season;
  competition!: Competition;
  phases!: Phase[];
  teams!: Team[];

  static fields() {
    return {
      leverade_id: this.string(null),
      directus_id: this.number(null),
      name: this.string(null),
      gender: this.string(null).nullable(),
      /** Leverade Season ID */
      season_id: this.string(null),
      season: this.belongsTo(Season, 'season_id', 'leverade_id'),
      competition_id: this.string(null),
      competition: this.belongsTo(Competition, 'competition_id'),
      phases: this.hasMany(Phase, 'competition_edition_id'),
      teams: this.hasMany(Team, 'competition_edition_id'),
    };
  }

  static getLastPhase(competitionSlug: string, seasonSlug: string): Phase {
    const competitionEdition = this.query()
      .with('phases', (query) => query.orderBy('order'))
      .with('competition')
      .with('season')
      .whereHas('competition', (query) => {
        query.where('slug', competitionSlug);
      })
      .whereHas('season', (query) => {
        query.where('slug', seasonSlug);
      })
      .first();

    if (!competitionEdition) {
      throw new Error(`No edition found for this competition in this season.`);
    }

    if (!competitionEdition.phases.length) {
      throw new Error(`This edition does not have any phase to show.`);
    }

    return competitionEdition.phases[competitionEdition.phases.length - 1];
  }
}
