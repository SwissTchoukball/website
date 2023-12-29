import { LiveStream } from '~/plugins/cms-service';
import { DirectusImage } from '~/plugins/directus';

export interface MenuItem {
  sort?: number;
  name: string;
  href?: string;
  isExternal?: boolean;
  children?: MenuItem[];
}

export interface EventType {
  id: number;
  name: string;
  name_plural: string;
  image?: DirectusImage;
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
  secondaryNavigation: MenuItem[];
  eventTypes?: EventTypes;
  playerPositions?: PlayerPositions;
  liveStreams: LiveStream[];
  upcomingMatchesLoaded: boolean;
  fullyLoadedCompetitionEditions: { season: string; competition: string }[];
}

export default (): RootState => ({
  mainNavigation: [],
  secondaryNavigation: [],
  eventTypes: undefined,
  playerPositions: undefined,
  liveStreams: [],
  upcomingMatchesLoaded: false,
  fullyLoadedCompetitionEditions: [],
});
