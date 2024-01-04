import { Model } from '@vuex-orm/core';
import Phase from '~/models/phase.model';
import Competition from '~/models/competition.model';
import Team from '~/models/team.model';

export default class CompetitionEdition extends Model {
  static entity = 'competition-editions';

  static primaryKey = 'leverade_id';

  leverade_id!: string;
  directus_id!: number;
  name!: string;
  gender!: string;
  /** Leverade Season ID */
  season_id!: string;
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
      competition: this.attr(null),
      phases: this.hasMany(Phase, 'competition_edition_id'),
      teams: this.hasMany(Team, 'competition_edition_id'),
    };
  }

  static getLastPhase(competitionSlug: string, seasonLeveradeId: string): Phase {
    const competitionEdition = this.query()
      .where('season_id', seasonLeveradeId)
      .where('competition', (competition: Competition) => competition.slug === competitionSlug)
      .with('phases', (query) => query.orderBy('order'))
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
