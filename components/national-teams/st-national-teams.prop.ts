export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

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

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  gender: Gender;
  role: string;
  date_start: string;
  date_end: string;
  track_record: string;
  portrait_square_head: string;
}

export interface Team {
  name: string;
  slug: string;
  gender: string;
  players: Player[];
  staff: StaffMember[];
}
