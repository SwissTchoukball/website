import type { DirectusFile } from '@directus/sdk';
import type { Gender, Role } from '~/plugins/08.cms-service';
import type { DirectusPerson, DirectusSchema } from '~/plugins/06.directus';

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  number?: number;
  is_captain: boolean;
  birth_year?: number;
  gender?: Gender;
  club?: {
    name: string;
  };
  positions: number[];
  date_start?: string;
  date_end?: string;
  track_record?: string;
  portrait_square_head?: string;
}

export interface NationalTeamCompetition {
  id: number;
  slug: string | null;
  name: string;
  year: number;
  logo?: string;
  city: string;
  country: string;
  live: string | null;
  about: string | null;
  schedule: string | null;
  medias: string | null;
  date_start?: string;
  date_end?: string;
  teams: { id: number; name: string }[];
  telegram_channel?: string;
}

export interface NationalTeamCompetitionUpdate {
  id: number;
  body: string;
  image?: DirectusFile<DirectusSchema>;
  is_key: boolean;
  teams: { id: number; name: string }[];
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
  team_photo?: DirectusFile<DirectusSchema>;
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
  team: Pick<NationalTeam, 'name' | 'slug'>;
  players: Player[];
  coaches: DirectusPerson[];
}

// Just to clear a Nuxt warning.
export default {};
