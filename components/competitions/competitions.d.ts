import { Season } from '~/store/state';

export interface NationalCompetitionEdition {
  id: number;
  season: Season;
  competition: number;
  leverade_id?: number;
}

export interface NationalCompetition {
  name: string;
  slug: string;
  editions: NationalCompetitionEdition[];
}
