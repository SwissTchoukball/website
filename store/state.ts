import { type DirectusFile } from '@directus/sdk';
import { TranslateResult } from 'vue-i18n';
import { Domain, LiveStream, ResourceType } from '~/plugins/cms-service';
import { DirectusSchema, DirectusSeason } from '~/plugins/directus';

export interface MenuItem {
  sort?: number;
  name: string | TranslateResult;
  href?: string;
  isExternal?: boolean;
  children?: MenuItem[];
}

export interface EventType {
  id: number;
  name: string;
  name_plural: string;
  image?: DirectusFile<DirectusSchema>;
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
  domains: Domain[];
  seasons: DirectusSeason[];
  resourceTypes: ResourceType[];
  eventTypes?: EventTypes;
  playerPositions?: PlayerPositions;
  liveStreams: LiveStream[];
}

export default (): RootState => ({
  mainNavigation: [],
  secondaryNavigation: [],
  domains: [],
  seasons: [],
  resourceTypes: [],
  eventTypes: undefined,
  playerPositions: undefined,
  liveStreams: [],
});
