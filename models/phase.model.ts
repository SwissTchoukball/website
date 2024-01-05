import { LeveradeGroup, LeveradeGroupType } from '~/plugins/leverade';
import Round from '~/models/round.model';
import Match from '~/models/match.model';
import CompetitionEdition from '~/models/competition-edition.model';

export default class Phase {
  static entity = 'phases';

  id: string;
  name: string;
  order: number;
  type: LeveradeGroupType;
  group: string | null;
  competition_edition_id: string;
  competition_edition?: CompetitionEdition;
  rounds?: Round[];

  constructor(leveradeGroup: LeveradeGroup) {
    this.id = leveradeGroup.id;
    this.name = leveradeGroup.attributes.name;
    this.order = leveradeGroup.attributes.order;
    this.type = leveradeGroup.attributes.type;
    this.group = leveradeGroup.attributes.group;
    this.competition_edition_id = leveradeGroup.relationships.tournament.data.id;
  }

  get futureMatches() {
    if (!this.rounds) {
      return [];
    }

    const matches = this.rounds.reduce((matchList, round) => {
      if (!round.matches) {
        return matchList;
      } else {
        return [...matchList, ...round.matches];
      }
    }, [] as Match[]);

    return matches.filter((match) => {
      return match.datetime && match.datetime >= new Date().toISOString().split('T')[0];
    });
  }
}
