import { Plugin } from '@nuxt/types';
import { Directus } from '@directus/sdk';

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

export interface DirectusPage {
  translations: {
    languages_code: string;
    path: string;
    title: string;
    body: string;
  }[];
}

export interface DirectusNewsCategory {
  id: number;
  news_categories_id: {
    translations: {
      name: string;
      slug: string;
    }[];
  };
}

export interface DirectusNews {
  id: number;
  date_created: string;
  date_updated: string;
  main_image: {
    id: string;
    description: string;
  };
  translations: {
    languages_code: string;
    slug: string;
    title: string;
    body: string;
  }[];
  categories: DirectusNewsCategory[];
}

export interface DirectusVenue {
  id: string;
  name: string;
  url?: string;
}

export interface DirectusEvent {
  id: number;
  name: string;
  date_start: string;
  time_start: string;
  date_end: string;
  time_end: string;
  status: string;
  description?: string;
  venue?: DirectusVenue;
  venue_other?: string;
  image?: {
    id: string;
    description: string;
  };
  url?: string;
  category?: number;
}

export interface DirectusEventCategory {
  id: number;
  name: string;
  translations: {
    name: string;
  }[];
}

export interface DirectusPlayerPosition {
  id: number;
  name: string;
  name_feminine: string;
  name_masculine: string;
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

export interface DirectusStaffMember {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  role: string;
  date_start: string;
  date_end: string;
  track_record: string;
  portrait_square_head: string;
}

export interface DirectusNationalTeamCompetition {
  name: string;
  year: number;
  logo: string;
  city: string;
  country: string;
}

export interface DirectusTeamResult {
  national_team_id: number;
  competition_id: DirectusNationalTeamCompetition;
  ranking: number;
}

export interface DirectusTeam {
  id: number;
  name: string;
  slug: string;
  gender: string;
  translations: {
    name: string;
    slug: string;
  }[];
  players: DirectusPlayer[];
  staff: { national_team_staff_id: DirectusStaffMember }[];
  results: DirectusTeamResult[];
  nations_cup_results: {
    [year: string]: string;
  };
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
  event_categories: DirectusEventCategory;
  national_teams: DirectusTeam;
  player_positions: DirectusPlayerPosition;
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
