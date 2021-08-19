import { DirectusSeason } from '~/plugins/directus';

// For now, a Season in the frontend is exactly the same as in Directus.
export type Season = DirectusSeason;

export interface MenuItem {
  sort?: number;
  name: string;
  href?: string;
  children?: MenuItem[];
}

export interface EventCategory {
  id: number;
  name: string;
}

export interface EventCategories {
  [id: number]: EventCategory;
}

export interface PlayerPosition {
  id: number;
  name: string;
  name_feminine: string;
  name_masculine: string;
}

export interface PlayerPositions {
  [id: number]: PlayerPositions;
}

export interface RootState {
  mainNavigation: MenuItem[];
  eventCategories?: EventCategories;
  playerPositions?: PlayerPositions;
  seasons?: Season[];
}

export default (): RootState => ({
  mainNavigation: [],
  eventCategories: undefined,
  playerPositions: undefined,
});
