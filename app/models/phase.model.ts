import type { LeveradeGroup, LeveradeGroupType } from '~/plugins/07.leverade';
import type Round from '~/models/round.model';
import type Match from '~/models/match.model';

export default class Phase {
  static entity = 'phases';

  id: string;
  name: string;
  order: number;
  type: LeveradeGroupType;
  group: string | null;
  competition_edition_id: string;
  rounds?: Round[];

  constructor(leveradeGroup: LeveradeGroup) {
    this.id = leveradeGroup.id;
    this.name = leveradeGroup.attributes.name;
    this.order = leveradeGroup.attributes.order;
    this.type = leveradeGroup.attributes.type;
    this.group = leveradeGroup.attributes.group;
    this.competition_edition_id = leveradeGroup.relationships.tournament.data.id;
  }

  get allMatches(): Match[] {
    if (!this.rounds) {
      return [];
    }
    return this.rounds.reduce((matchList, round) => {
      if (!round.matches) {
        return matchList;
      }
      return [
        ...matchList,
        ...round.matches.map((match) => {
          match.round_name = round.name;
          match.phase_name = this.name;
          match.phase_type = this.type;
          return match;
        }),
      ];
    }, [] as Match[]);
  }

  get futureMatches(): Match[] {
    return this.allMatches
      .filter((match) => !match.finished && match.datetime && match.datetime >= new Date().toISOString().split('T')[0]!)
      .sort((matchA, matchB) => {
        if (matchA.datetime && matchB.datetime) {
          return matchA.datetime < matchB.datetime ? -1 : matchA.datetime > matchB.datetime ? 1 : 0;
        }
        return matchA.datetime ? 1 : matchB.datetime ? -1 : 0;
      });
  }

  get lastFinishedMatches(): Match[] {
    return this.allMatches
      .filter((match) => match.finished && !match.canceled && !match.rest)
      .sort((matchA, matchB) => {
        if (matchA.datetime && matchB.datetime) {
          return matchA.datetime < matchB.datetime ? 1 : matchA.datetime > matchB.datetime ? -1 : 0;
        }
        return matchA.datetime ? 1 : matchB.datetime ? -1 : 0;
      });
  }
}
