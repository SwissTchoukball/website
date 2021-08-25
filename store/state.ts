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
  upcomingMatchesLoaded: boolean;
  fullyLoadedCompetitionEditions: { season: string; competition: string }[];
}

export default (): RootState => ({
  mainNavigation: [],
  eventCategories: undefined,
  playerPositions: undefined,
  upcomingMatchesLoaded: false,
  fullyLoadedCompetitionEditions: [],
});
