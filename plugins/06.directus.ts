import { createDirectus, rest, type DirectusClient, type DirectusFile, type RestClient } from '@directus/sdk';

interface DirectusGroupTranslation {
  languages_code: string;
  name: string;
  description: string;
  slug: string;
}

export interface DirectusGroup {
  id: number;
  translations: DirectusGroupTranslation[];
}

interface DirectusRoleTranslation {
  languages_code: string;
  name: string;
  name_feminine: string;
  name_masculine: string;
}

export interface DirectusRole {
  id: number;
  translations: DirectusRoleTranslation[];
  group: DirectusGroup;
  holders: DirectusRolePerson[];
}

export type DirectusGender = 'male' | 'female' | 'other';

export interface DirectusPerson {
  id: number;
  first_name: string;
  last_name: string;
  portrait_square_head: string;
  gender: DirectusGender;
  email: string;
  roles: DirectusRolePerson[];
}

interface DirectusRolePerson {
  id: number;
  roles_id: DirectusRole;
  people_id: DirectusPerson;
  main: boolean;
}

interface DirectusMenuItemTranslation {
  languages_code: string;
  name: string;
  href?: string;
}

export interface DirectusMenuItem {
  sort: number;
  parent: number;
  translations: DirectusMenuItemTranslation[];
  children: DirectusMenuItem[];
}

interface DirectusDomainTranslation {
  languages_code: string;
  name: string;
}

export interface DirectusDomain {
  id: number;
  name: string;
  translations: DirectusDomainTranslation[];
}

interface DirectusResourceTypeTranslation {
  languages_code: string;
  name: string;
}

export interface DirectusResourceType {
  id: number;
  translations: DirectusResourceTypeTranslation[];
}

export enum DirectusResourceStatus {
  VISIBLE = 'visible',
  ARCHIVED = 'archived',
}

interface DirectusPageResource {
  id: number;
  pages_id: number | DirectusPage;
  resources_id: DirectusResource;
}

interface DirectusPageRole {
  id: number;
  pages_id: number | DirectusPage;
  roles_id: DirectusRole;
}

interface DirectusResourceDomain {
  id: number;
  domains_id: DirectusDomain;
  resources_id: DirectusResource;
}

interface DirectusResourceTranslation {
  languages_code: string;
  name: string;
  file?: DirectusFile<DirectusSchema>;
  link?: string;
}

export interface DirectusResource {
  id: number;
  translations: DirectusResourceTranslation[];
  type: DirectusResourceType;
  domains: DirectusResourceDomain[];
  date: string;
  keywords: string;
  status: DirectusResourceStatus;
}

interface DirectusPageTranslation {
  languages_code: string;
  path: string;
  title: string;
  body: string;
}

export interface DirectusPage {
  id: number;
  status: 'published' | 'hidden';
  translations: DirectusPageTranslation[];
  key_roles: DirectusPageRole[];
  resources: DirectusPageResource[];
}

interface DirectusTextTranslation {
  languages_code: string;
  body: string;
}

export interface DirectusText {
  id: number;
  translations: DirectusTextTranslation[];
}

export interface DirectusNewsDomainPivot {
  id: number;
  domains_id: DirectusDomain;
}

interface DirectusNewsTranslation {
  languages_code: string;
  slug: string;
  title: string;
  body: string;
}

export interface DirectusNews {
  id: number;
  status: string;
  hide_from_home: boolean;
  prioritise_on_home: boolean;
  date_created: 'datetime';
  date_updated: 'datetime';
  main_image: DirectusFile<DirectusSchema>;
  translations: DirectusNewsTranslation[];
  domains: DirectusNewsDomainPivot[];
}

interface DirectusPressReleaseTranslation {
  languages_code: string;
  context?: string;
  title: string;
  slug: string;
  body: string;
}

export interface DirectusPressRelease {
  id: number;
  date_created: 'datetime';
  date_updated?: 'datetime';
  status: string;
  translations: DirectusPressReleaseTranslation[];
}

export interface DirectusVenue {
  id: string;
  name: string;
  city?: string;
  address?: string;
  url?: string;
}

interface DirectusEventTypeTranslation {
  languages_code: string;
  name: string;
  name_plural: string;
}

export interface DirectusEventType {
  id: number;
  translations: DirectusEventTypeTranslation[];
  image?: DirectusFile<DirectusSchema>;
}

interface DirectusEventTranslation {
  languages_code: string;
  name: string;
  description: string;
}

export interface DirectusEvent {
  id: number;
  translations: DirectusEventTranslation[];
  date_start: 'datetime';
  time_start: string;
  date_end: 'datetime';
  time_end: string;
  status: string;
  venue?: DirectusVenue;
  venue_other?: string;
  image?: DirectusFile<DirectusSchema>;
  url?: string;
  type?: DirectusEventType;
}

interface DirectusPlayerPositionTranslation {
  languages_code: string;
  name: string;
  name_feminine: string;
  name_masculine: string;
}

export interface DirectusPlayerPosition {
  id: number;
  translations: DirectusPlayerPositionTranslation[];
}

export interface DirectusPlayer {
  id: number;
  first_name: string;
  last_name: string;
  number: number;
  is_captain: boolean;
  birth_year: number;
  gender: DirectusGender;
  club: DirectusClub;
  positions: {
    player_positions_id: number;
  }[];
  date_start: 'datetime';
  date_end: 'datetime';
  track_record: string;
  portrait_square_head: string;
}

interface DirectusNationalTeamCompetitionTranslation {
  languages_code: string;
  name: string;
  city: string;
  country: string;
  live: string | null;
  about: string | null;
  schedule: string | null;
  medias: string | null;
}

export interface DirectusNationalTeamCompetition {
  id: number;
  slug: string | null;
  year: number;
  date_start: 'datetime';
  date_end: 'datetime';
  logo: string;
  telegram_channel: string;
  teams: {
    team: {
      id: number;
      translations: DirectusTeamTranslation[];
    };
  }[];
  translations: DirectusNationalTeamCompetitionTranslation[];
}

export interface DirectusTeamResult {
  national_team_id: number;
  competition_id: DirectusNationalTeamCompetition;
  ranking: number;
}

interface DirectusTeamTranslation {
  languages_code: string;
  name: string;
  slug: string;
}

export interface DirectusTeam {
  id: number;
  gender: DirectusGender;
  translations: DirectusTeamTranslation[];
  team_photo?: DirectusFile<DirectusSchema>;
  team_photo_vertical_shift?: number;
  players: DirectusPlayer[];
  staff: { roles_id: DirectusRole }[];
  results: DirectusTeamResult[];
  nations_cup_results: {
    [year: string]: string;
  };
}

export interface DirectusNationalTeamCompetitionsTeam {
  id: number;
  competition: DirectusNationalTeamCompetition;
  team: DirectusTeam;
  players: {
    national_team_players_id: DirectusPlayer;
  }[];
  coaches: {
    people_id: DirectusPerson;
  }[];
}

export type DirectusNationalTeamCompetitionUpdateStatus = 'published' | 'draft' | 'archived';

interface DirectusNationalTeamCompetitionUpdateTranslation {
  languages_code: string;
  body: string;
}

export interface DirectusNationalTeamCompetitionUpdate {
  id: number;
  translations: DirectusNationalTeamCompetitionUpdateTranslation[];
  image?: DirectusFile<DirectusSchema>;
  competition: DirectusNationalTeamCompetition;
  status: DirectusNationalTeamCompetitionUpdateStatus;
  is_key: boolean | null;
  teams: {
    team_id: DirectusNationalTeamCompetitionsTeam;
  }[];
  date_created: 'datetime';
  date_updated: 'datetime';
}

export interface DirectusSeason {
  id: number;
  name: string;
  slug: string;
  date_start: 'datetime';
  date_end: 'datetime';
  leverade_id?: number;
}

interface DirectusAnnouncementTranslation {
  languages_code: string;
  title: string;
}

export interface DirectusAnnouncement {
  id: number;
  translations: DirectusAnnouncementTranslation[];
  url?: string;
  date_start?: 'datetime';
  date_end?: 'datetime';
}

interface DirectusLiveStreamTranslation {
  languages_code: string;
  title: string;
}

export interface DirectusLiveStream {
  id: number;
  translations: DirectusLiveStreamTranslation[];
  url: string;
  date_start: 'datetime';
  date_end: 'datetime';
  stream_start: string;
}

export interface DirectusNationalCompetitionEdition {
  id: number;
  season: DirectusSeason;
  competition: DirectusNationalCompetition;
  leverade_id?: number;
}

export interface DirectusMatchAdditionalData {
  id: number;
  leverade_id: number;
  flickr_photoset_id?: string;
  youtube_video_id?: string;
}

interface DirectusNationalCompetitionTranslation {
  languages_code: string;
  name: string;
  slug: string;
}

export interface DirectusNationalCompetition {
  id: number;
  editions: DirectusNationalCompetitionEdition[];
  translations: DirectusNationalCompetitionTranslation[];
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
  cover: DirectusFile<DirectusSchema>;
  file: DirectusFile<DirectusSchema>;
}

export type DirectusSchema = {
  /*
	This type will be merged with Directus user type.
	It's important that the naming matches a directus
	collection name exactly. Typos won't get caught here
	since SDK will assume it's a custom user collection.
	*/
  menus: DirectusMenuItem[];
  menu_translations: DirectusMenuItemTranslation[];
  pages: DirectusPage[];
  page_translations: DirectusPageTranslation[];
  texts: DirectusText[];
  text_translation: DirectusTextTranslation[];
  news: DirectusNews[];
  news_translations: DirectusNewsTranslation[];
  press_releases: DirectusPressRelease[];
  press_release_translations: DirectusPressReleaseTranslation[];
  events: DirectusEvent[];
  event_translations: DirectusEventTranslation[];
  event_types: DirectusEventType[];
  event_type_translations: DirectusEventTypeTranslation[];
  venues: DirectusVenue[];
  national_teams: DirectusTeam[];
  national_team_translations: DirectusTeamTranslation[];
  national_team_competitions: DirectusNationalTeamCompetition[];
  national_team_competition_translations: DirectusNationalTeamCompetitionTranslation[];
  national_team_competitions_teams: DirectusNationalTeamCompetitionsTeam[];
  national_teams_competitions_updates: DirectusNationalTeamCompetitionUpdate[];
  national_teams_competitions_update_translations: DirectusNationalTeamCompetitionUpdateTranslation[];
  player_positions: DirectusPlayerPosition[];
  player_position_translations: DirectusPlayerPositionTranslation[];
  seasons: DirectusSeason[];
  announcements: DirectusAnnouncement[];
  announcement_translations: DirectusAnnouncementTranslation[];
  live_streams: DirectusLiveStream[];
  live_stream_translations: DirectusLiveStreamTranslation[];
  national_competitions: DirectusNationalCompetition[];
  national_competition_translations: DirectusNationalCompetitionTranslation[];
  national_competition_editions: DirectusNationalCompetitionEdition[];
  match_additional_data: DirectusMatchAdditionalData[];
  domains: DirectusDomain[];
  domain_translations: DirectusMenuItemTranslation[];
  resources: DirectusResource[];
  resource_translations: DirectusResourceTranslation[];
  resource_types: DirectusResourceType[];
  resource_type_translations: DirectusResourceTypeTranslation[];
  clubs: DirectusClub[];
  groups: DirectusGroup[];
  group_translations: DirectusGroupTranslation[];
  roles: DirectusRole[];
  role_translations: DirectusRoleTranslation[];
  people: DirectusPerson[];
  tchoukup: DirectusTchoukup[];

  // Relation models
  relation_roles_people: DirectusRolePerson[];
  relation_pages_resources: DirectusPageResource[];
  relation_page_roles: DirectusPageRole[];
  relation_news_domain: DirectusNewsDomainPivot[];

  // Because of an ongoing bug, we have to declare the Directus types that we use.
  // See https://github.com/directus/directus/issues/19815
  // TODO: Remove those when the bug will be resolved.
  directus_files: DirectusFile<object>[];
};

declare module '#app' {
  interface NuxtApp {
    $directus: DirectusClient<DirectusSchema> & RestClient<DirectusSchema>;
  }
}

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();

  // We need to do this for the plugin to be able to get initialise properly in SSR.
  globalThis.URL = URL;

  const directus = createDirectus<DirectusSchema>(runtimeConfig.public.cmsURL, { globals: { URL } }).with(rest());

  return {
    provide: {
      directus,
    },
  };
});

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
  entity: Record<string, any> & { translations: Record<string, any>[] },
  languageKey?: string,
) => {
  if (entity.translations) {
    if (languageKey && entity.translations.length > 1) {
      const translation = entity.translations.find((t) => t?.languages_code === languageKey);
      const firstAlternativeTranslation = entity.translations.find((t) => t?.languages_code !== languageKey);
      if (translation) {
        if (firstAlternativeTranslation) {
          for (const [key, translatedText] of Object.entries(translation)) {
            if (!translatedText) {
              translation[key] = firstAlternativeTranslation[key];
            }
          }
        }
        return translation;
      }
    }
    if (entity.translations[0]) {
      return entity.translations[0];
    }
  }
};
