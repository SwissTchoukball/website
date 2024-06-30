import Phase from '~/models/phase.model';
import Competition from '~/models/competition.model';
import Team from '~/models/team.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';
import type {
  LeveradeFaceoff,
  LeveradeFacility,
  LeveradeGroup,
  LeveradeMatch,
  LeveradeResult,
  LeveradeRound,
  LeveradeTeam,
  LeveradeTournament,
} from '~/plugins/07.leverade';
import Round from '~/models/round.model';
import Faceoff from '~/models/faceoff.model';
import Match from '~/models/match.model';
import type Season from '~/models/season.model';

export default class CompetitionEdition {
  leverade_id?: string;
  directus_id: number;
  name: string;
  gender?: string;
  /** Leverade Season ID */
  season_id?: string;
  season?: Season;
  competition: Competition;
  teams?: Team[];
  phases?: Phase[];
  rounds?: Round[];
  faceoffs?: Faceoff[];
  matches?: Match[];
  facilities?: any[];
  results?: any[];

  private _hasLeveradeData = false;

  constructor(edition: NationalCompetitionEdition, season?: Season) {
    this.leverade_id = edition.leverade_id?.toString();
    this.directus_id = edition.directus_id;
    this.name = edition.competition.name;
    this.season_id = edition.season.leverade_id?.toString();
    this.season = season;
    this.competition = new Competition(edition.competition);
  }

  get hasLeveradeData(): boolean {
    return this._hasLeveradeData;
  }

  addLeveradeData({
    tournament,
    teams,
    groups,
    rounds,
    faceoffs,
    matches,
    facilities,
    results,
  }: {
    tournament: LeveradeTournament;
    teams?: LeveradeTeam[];
    groups?: LeveradeGroup[];
    rounds?: LeveradeRound[];
    faceoffs?: LeveradeFaceoff[];
    matches?: LeveradeMatch[];
    facilities?: LeveradeFacility[];
    results?: LeveradeResult[];
  }): void {
    if (this.leverade_id && this.leverade_id !== tournament.id) {
      throw new Error('Leverade tournament ID does not match competition edition leverade_id');
    }

    this.name = tournament.attributes.name;
    this.gender = tournament.attributes.gender;

    if (teams) {
      this.teams = teams.map((team) => new Team(team));
    }

    if (matches) {
      this.matches = matches.map((leveradeMatch) => {
        const match = new Match(leveradeMatch);
        if (this.teams) {
          match.setTeams(this.teams);
        }
        if (results) {
          match.setResults(results);
        }
        if (facilities) {
          match.setFacility(facilities);
        }
        // We don't set periods or referee data because it's shown only on the match page,
        // which doesn't use the CompetitionEdition model.
        return match;
      });
    }

    if (faceoffs) {
      this.faceoffs = faceoffs.map((leveradeFaceoff) => {
        const faceoff = new Faceoff(leveradeFaceoff);
        if (this.teams) {
          faceoff.setTeams(this.teams);
        }
        faceoff.matches = this.matches?.filter((match) => match.faceoff_id === faceoff.id);
        return faceoff;
      });
    }

    if (rounds) {
      this.rounds = rounds.map((leveradeRound) => {
        const round = new Round(leveradeRound);
        round.faceoffs = this.faceoffs?.filter((faceoff) => faceoff.round_id === round.id);
        round.matches = this.matches?.filter((match) => match.round_id === round.id);
        return round;
      });
    }

    if (groups) {
      this.phases = groups
        .sort((phaseA, phaseB) => phaseA.attributes.order - phaseB.attributes.order)
        .map((group) => {
          const phase = new Phase(group);
          phase.rounds = this.rounds?.filter((round) => round.phase_id === phase.id);
          return phase;
        });
    }
    this.facilities = facilities;
    this.results = results;

    this._hasLeveradeData = true;
  }

  get lastPhase(): Phase | undefined {
    if (!this.phases?.length) {
      return;
    }

    return this.phases[this.phases.length - 1];
  }
}
