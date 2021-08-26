export interface MenuItem {
  sort?: number;
  name: string;
  href?: string;
  children?: MenuItem[];
}

export interface EventType {
  id: number;
  name: string;
}

export interface EventTypes {
  [id: number]: EventType;
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
  eventTypes?: EventTypes;
  playerPositions?: PlayerPositions;
  upcomingMatchesLoaded: boolean;
  fullyLoadedCompetitionEditions: { season: string; competition: string }[];
}

export default (): RootState => ({
  mainNavigation: [],
  eventTypes: undefined,
  playerPositions: undefined,
  upcomingMatchesLoaded: false,
  fullyLoadedCompetitionEditions: [],
});
