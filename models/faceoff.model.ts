import Team from '~/models/team.model';
import Match from '~/models/match.model';
import { LeveradeFaceoff, LeveradeTeam } from '~/plugins/leverade';

export default class Faceoff {
  static entity = 'faceoffs';

  id: string;
  round_id: string;
  first_team_id: string | null;
  leverade_first_team?: LeveradeTeam;
  first_team?: Team;
  /**
   * Placeholder for when the first team is not defined yet
   */
  first_text: string | null;
  second_team_id: string | null;
  leverade_second_team?: LeveradeTeam;
  second_team?: Team;
  /**
   * Placeholder for when the second team is not defined yet
   */
  second_text: string | null;
  winner: 'first' | 'second' | null;
  matches?: Match[];

  constructor(faceoff: LeveradeFaceoff) {
    this.id = faceoff.id;
    this.round_id = faceoff.relationships.round.data.id;
    this.first_team_id = faceoff.relationships.first_team.data?.id || null;
    this.first_text = faceoff.attributes.first_text;
    this.second_team_id = faceoff.relationships.second_team.data?.id || null;
    this.second_text = faceoff.attributes.second_text;
    this.winner = faceoff.attributes.winner;
  }

  /**
   * Sets the first and second team instances out of the provided list of teams
   */
  setTeams(teams: Team[]) {
    if (this.first_team_id) {
      this.first_team = teams.find((team) => team.id === this.first_team_id);
    }

    if (this.second_team_id) {
      this.second_team = teams.find((team) => team.id === this.second_team_id);
    }
  }
}
