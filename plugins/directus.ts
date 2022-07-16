import { Plugin } from '@nuxt/types';
import { Directus, PartialItem } from '@directus/sdk';

export interface DirectusGroup {
  id: number;
  translations: {
    name: string;
    description: string;
  }[];
}

export interface DirectusRole {
  id: number;
  translations: {
    name: string;
    name_feminine: string;
    name_masculine: string;
  }[];
  group: DirectusGroup;
  // eslint-disable-next-line no-use-before-define
  holders: DirectusRolePerson[];
}

export interface DirectusPerson {
  id: number;
  first_name: string;
  last_name: string;
  portrait_square_head: string;
  gender: string;
  email: string;
  // eslint-disable-next-line no-use-before-define
  roles: DirectusRolePerson[];
}

export interface DirectusRolePerson {
  id: number;
  roles_id: DirectusRole;
  people_id: DirectusPerson;
  main: boolean;
}

export interface DirectusMenuItem {
  sort: number;
  parent: number;
  translations: {
    languages_code: string;
    name: string;
    href?: string;
  }[];
  children: DirectusMenuItem[];
}

export interface DirectusFile {
  id: number;
  type: string;
  filesize: number;
  filename_download: string;
}

export interface DirectusImage {
  id: string;
  description: string;
}

export interface DirectusResourceType {
  id: number;
  translations: {
    name: string;
  }[];
}

export enum DirectusResourceStatus {
  VISIBLE = 'visible',
  ARCHIVED = 'archived',
}

export interface DirectusResource {
  id: number;
  translations: {
    name: string;
    file?: DirectusFile;
    link?: string;
  }[];
  type: DirectusResourceType;
  domains: number[];
  date: string;
  status: DirectusResourceStatus;
}

export interface DirectusPage {
  translations: {
    languages_code: string;
    path: string;
    title: string;
    body: string;
  }[];
  key_roles: {
    id: number;
    pages_id: DirectusPage;
    roles_id: DirectusRole;
  }[];
  resources: {
    id: number;
    pages_id: DirectusPage;
    resources_id: DirectusResource;
  }[];
}

export interface DirectusDomain {
  id: number;
  translations: {
    name: string;
  }[];
}

export interface DirectusNewsDomainPivot {
  id: number;
  domains_id: DirectusDomain;
}

export interface DirectusNews {
  id: number;
  date_created: string;
  date_updated: string;
  main_image: DirectusImage;
  translations: {
    languages_code: string;
    slug: string;
    title: string;
    body: string;
  }[];
  domains: DirectusNewsDomainPivot[];
}

export interface DirectusVenue {
  id: string;
  name: string;
  city?: string;
  address?: string;
  url?: string;
}

export interface DirectusEvent {
  id: number;
  translations: {
    name: string;
    description: string;
  }[];
  date_start: string;
  time_start: string;
  date_end: string;
  time_end: string;
  status: string;
  venue?: DirectusVenue;
  venue_other?: string;
  image?: DirectusImage;
  url?: string;
  type?: number;
}

export interface DirectusEventType {
  id: number;
  translations: {
    name: string;
  }[];
  image?: DirectusImage;
}

export interface DirectusPlayerPosition {
  id: number;
  translations: {
    name: string;
    name_feminine: string;
    name_masculine: string;
  }[];
}

export interface DirectusPlayer {
  id: number;
  first_name: string;
  last_name: string;
  number: number;
  is_captain: boolean;
  birth_year: number;
  gender: string;
  club: {
    name: string;
  };
  positions: {
    player_positions_id: number;
  }[];
  date_start: string;
  date_end: string;
  track_record: string;
  portrait_square_head: string;
}

export interface DirectusNationalTeamCompetition {
  year: number;
  logo: string;
  translations: {
    name: string;
    city: string;
    country: string;
  }[];
}

export interface DirectusTeamResult {
  national_team_id: number;
  competition_id: DirectusNationalTeamCompetition;
  ranking: number;
}

export interface DirectusTeam {
  id: number;
  gender: string;
  translations: {
    name: string;
    slug: string;
  }[];
  team_photo?: DirectusImage;
  team_photo_vertical_shift?: number;
  players: DirectusPlayer[];
  staff: { roles_id: DirectusRole }[];
  results: DirectusTeamResult[];
  nations_cup_results: {
    [year: string]: string;
  };
}

export interface DirectusSeason {
  id: number;
  name: string;
  slug: string;
  date_start: string;
  date_end: string;
  leverade_id?: number;
}

export interface DirectusNationalCompetitionEdition {
  id: number;
  season: DirectusSeason;
  // eslint-disable-next-line no-use-before-define
  competition: DirectusNationalCompetition;
  leverade_id?: number;
}

export interface DirectusNationalCompetition {
  id: number;
  editions: DirectusNationalCompetitionEdition[];
  translations: {
    name: string;
    slug: string;
  }[];
}

export interface DirectusClub {
  id: number;
  name: string;
  name_full: string;
  name_sort: string;
  status: string;
  website: string;
  logo: string;
}

export interface DirectusTchoukup {
  id: number;
  number: string;
  releaseDate: string;
  cover: DirectusImage;
  file: DirectusFile;
}

type CustomTypes = {
  /*
	This type will be merged with Directus user type.
	It's important that the naming matches a directus
	collection name exactly. Typos won't get caught here
	since SDK will assume it's a custom user collection.
	*/
  menus: DirectusMenuItem;
  pages: DirectusPage;
  news: DirectusNews;
  events: DirectusEvent;
  event_types: DirectusEventType;
  national_teams: DirectusTeam;
  player_positions: DirectusPlayerPosition;
  seasons: DirectusSeason;
  national_competitions: DirectusNationalCompetition;
  national_competition_editions: DirectusNationalCompetitionEdition;
  domains: DirectusDomain;
  resources: DirectusResource;
  resource_types: DirectusResourceType;
  clubs: DirectusClub;
  groups: DirectusGroup;
  roles: DirectusRole;
  people: DirectusPerson;
  tchoukup: DirectusTchoukup;
};

declare module 'vue/types/vue' {
  // this.$directus inside Vue components
  interface Vue {
    $directus: Directus<CustomTypes>;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$directus inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $directus: Directus<CustomTypes>;
  }
  // nuxtContext.$directus
  interface Context {
    $directus: Directus<CustomTypes>;
  }
}

declare module 'vuex/types/index' {
  // this.$directus inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $directus: Directus<CustomTypes>;
  }
}

const directusPlugin: Plugin = (context, inject) => {
  const directus = new Directus<CustomTypes>(context.$config.cmsURL);

  inject('directus', directus);
};

export default directusPlugin;

export const getAssetURL = (cmsURL: string, assetId: string, params: { [key: string]: string | number }) => {
  const paramsString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  let assetUrl = `${cmsURL}/assets/${assetId}/`;
  if (paramsString) {
    assetUrl += `?${paramsString}`;
  }
  return assetUrl;
};

export const getAssetSrcSetEntry = (cmsURL: string, assetId: string, { width }: { width: number }) => {
  return `${getAssetURL(cmsURL, assetId, { width })} ${width}w`;
};

export const getAssetSrcSet = (cmsURL: string, assetId: string, { widths }: { widths: number[] }) => {
  return widths.map((width) => getAssetSrcSetEntry(cmsURL, assetId, { width })).join(',');
};

/**
 * Returns the translated fields of the specified language.
 * If the language is not specified, or if there is no translation available in the specified language,
 * the first available language of the entity translations is returned
 */
export const getTranslatedFields = (
  entity: PartialItem<{ [key: string]: any } & { translations: { [key: string]: any }[] }>,
  languageKey?: string
) => {
  if (entity.translations) {
    if (languageKey) {
      const translation = entity.translations.find((t) => t?.languages_code === languageKey);
      if (translation) {
        return translation;
      }
    }
    if (entity.translations[0]) {
      return entity.translations[0];
    }
  }
};
