import { Gender, Role } from '~/plugins/cms-service';
import { DirectusImage } from '~/plugins/directus';

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

export interface NationalTeamCompetition {
  id: number;
  name: string;
  year: number;
  logo?: string;
  city: string;
  country: string;
  date_start?: string;
  date_end?: string;
  telegram_channel?: string;
}

export interface NationalTeamCompetitionUpdate {
  id: number;
  body: string;
  image?: DirectusImage;
  date_created: string;
  date_updated?: string;
}

export interface NationalTeamResult {
  competition: NationalTeamCompetition;
  ranking: number;
}

export interface NationalTeam {
  name: string;
  slug: string;
  gender: string;
  team_photo?: DirectusImage;
  team_photo_vertical_shift?: number;
  players: Player[];
  /**
   * Array of role IDs
   */
  staff: Role[];
  results: NationalTeamResult[];
  nationsCupResults: {
    [year: string]: string;
  };
}

export interface NationalTeamForCompetition {
  id: number;
  competition: NationalTeamCompetition;
  team: Pick<NationalTeam, 'name'>;
  players: Player[];
  coaches: number[];
}
