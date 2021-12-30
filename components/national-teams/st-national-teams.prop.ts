import { Gender } from '~/models/person.model';
import { DirectusNationalTeamCompetition } from '~/plugins/directus';

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  number: number;
  is_captain: boolean;
  birth_year: number;
  gender: Gender;
  club: {
    name: string;
  };
  positions: string[];
  date_start: string;
  date_end: string;
  track_record: string;
  portrait_square_head: string;
}

export interface NationalTeamResult {
  competition: DirectusNationalTeamCompetition;
  ranking: number;
}

export interface NationalTeam {
  name: string;
  slug: string;
  gender: string;
  players: Player[];
  /**
   * Array of role IDs
   */
  staff: number[];
  results: NationalTeamResult[];
  nationsCupResults: {
    [year: string]: string;
  };
}
