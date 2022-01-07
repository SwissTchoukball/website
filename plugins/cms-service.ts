import { Plugin } from '@nuxt/types';
import { set } from 'date-fns';
import { Filter, PartialItem } from '@directus/sdk';
import { Await } from '~/types/types.utils';
import {
  DirectusNationalCompetitionEdition,
  DirectusResource,
  DirectusRole,
  DirectusSeason,
  getTranslatedFields,
} from '~/plugins/directus';
import { NewsEntry } from '~/components/news/st-news';
import { NationalTeam, NationalTeamResult } from '~/components/national-teams/st-national-teams.prop';
import Domain from '~/models/domain.model';
import Role from '~/models/role.model';
import Resource from '~/models/resource.model';

export interface SimplePage {
  languages_code: string;
  title: string;
  body: string;
  path: string;
  key_roles: number[];
  resources: number[];
}
export interface Venue {
  name: string;
  city?: string;
  address?: string;
  url?: string;
}
export interface CalendarEvent {
  id: number;
  name: string;
  date_start: Date;
  date_end: Date;
  isFullDay: boolean;
  showEndTime: boolean;
  status: string;
  description?: string;
  venue?: Venue;
  image?: {
    id: string;
    description: string;
  };
  url?: string;
  type: number;
}

interface NationalCompetitionEdition {
  directus_id: number;
  season: DirectusSeason;
  // eslint-disable-next-line no-use-before-define
  competition: number | NationalCompetition;
  leverade_id?: number;
}

interface NationalCompetition {
  id: number;
  name: string;
  slug: string;
  editions?: NationalCompetitionEdition[];
}

export interface CMSService {
  getPage: (options: { pagePath: string }) => Promise<PartialItem<SimplePage>>;
  getNews: (options: {
    limit: number;
    page: number;
    domainId?: number;
    withImageOnly?: boolean;
  }) => Promise<{ data: NewsEntry[]; meta: { total: number; filteredDomainName?: string } }>;
  getOneNews: (newsId: number) => Promise<NewsEntry>;
  getEvents: (options: {
    limit: number;
    page: number;
    typeId?: number;
    month?: string;
    upcoming?: boolean;
    excludeCancelled?: boolean;
  }) => Promise<{ data: CalendarEvent[]; meta: { total: number; filteredDomainName?: string } }>;
  getTeam: (teamSlug: string) => Promise<NationalTeam>;
  getSeasons: () => Promise<DirectusSeason[]>;
  getNationalCompetition: (competitionSlug: string) => Promise<NationalCompetition>;
  getNationalCompetitionEditions: ({
    competitionSlug,
    seasonSlug,
    leveradeIds,
  }: {
    competitionSlug?: string;
    seasonSlug?: string;
    leveradeIds?: string[];
  }) => Promise<NationalCompetitionEdition[]>;
  searchResources: (searchTerm: string, domainId?: number, typeId?: number) => Promise<Resource[]>;
}

declare module 'vue/types/vue' {
  // this.$cmsService inside Vue components
  interface Vue {
    $cmsService: CMSService;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$cmsService inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $cmsService: CMSService;
  }
  // nuxtContext.$cmsService
  interface Context {
    $cmsService: CMSService;
  }
}

declare module 'vuex/types/index' {
  // this.$cmsService inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $cmsService: CMSService;
  }
}

const cmsService: Plugin = (context, inject) => {
  /**
   * Fetches the data of a simple page for a specific locale
   */
  const fetchPage = async (pagePath: string, locale: string) => {
    const pageResponse = await context.$directus.items('pages').readMany({
      // @ts-ignore Bug with Directus SDK. It's okay to filter more than one level deep.
      filter: { translations: { path: { _eq: pagePath } } },
      fields: [
        'id',
        'translations.languages_code',
        'translations.path',
        'translations.title',
        'translations.body',
        'key_roles.roles_id.id',
        'key_roles.roles_id.translations.name',
        'key_roles.roles_id.translations.name_feminine',
        'key_roles.roles_id.translations.name_masculine',
        'key_roles.roles_id.holders.people_id.id',
        'key_roles.roles_id.holders.people_id.first_name',
        'key_roles.roles_id.holders.people_id.last_name',
        'key_roles.roles_id.holders.people_id.email',
        'key_roles.roles_id.holders.people_id.gender',
        'key_roles.roles_id.holders.people_id.portrait_square_head',
        'resources.resources_id.id',
        'resources.resources_id.name',
        'resources.resources_id.file.id',
        'resources.resources_id.file.type',
        'resources.resources_id.file.filesize',
        'resources.resources_id.file.filename_download',
        'resources.resources_id.link',
        'resources.resources_id.type',
        'resources.resources_id.domains.domains_id',
        'resources.resources_id.translations.name',
        'resources.resources_id.translations.file.id',
        'resources.resources_id.translations.file.type',
        'resources.resources_id.translations.file.filesize',
        'resources.resources_id.translations.file.filename_download',
        'resources.resources_id.translations.link',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        key_roles: { roles_id: { translations: { _filter: { languages_code: { _eq: locale } } } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        resources: { resources_id: { translations: { _filter: { languages_code: { _eq: locale } } } } },
      },
      limit: 1,
    });

    if (!pageResponse.data?.length) {
      throw new Error('pageNotFound');
    }

    if (!pageResponse.data[0].translations?.length || !pageResponse.data[0].translations[0]) {
      throw new Error('noData');
    }

    if (
      !pageResponse.data[0].translations[0].languages_code ||
      !pageResponse.data[0].translations[0].path ||
      !pageResponse.data[0].translations[0].title ||
      !pageResponse.data[0].translations[0].body
    ) {
      throw new Error('Missing required data for simple page');
    }

    const pageData: SimplePage = {
      languages_code: pageResponse.data[0].translations[0].languages_code,
      path: pageResponse.data[0].translations[0].path,
      title: pageResponse.data[0].translations[0].title,
      body: pageResponse.data[0].translations[0].body,
      key_roles: [],
      resources: [],
    };

    if (pageResponse.data[0].key_roles) {
      // We save the roles in the store and only provide the role IDs with the page data
      pageData.key_roles.push(
        ...(pageResponse.data[0].key_roles.map((pageRole) => pageRole?.roles_id?.id) as number[])
      );
      Role.addManyFromDirectus(
        pageResponse.data[0].key_roles.map((pageRole) => pageRole?.roles_id) as PartialItem<DirectusRole>[]
      );
    }

    if (pageResponse.data[0].resources) {
      // We save the resources in the store and only provide the resource IDs with the page data
      pageData.resources.push(
        ...(pageResponse.data[0].resources.map((resource) => resource?.resources_id?.id) as number[])
      );
      Resource.addManyFromDirectus(
        pageResponse.data[0].resources.map((resource) => resource?.resources_id) as PartialItem<DirectusResource>[]
      );
    }

    return pageData;
  };

  /**
   * Returns the data of a simple page in the appropriate language based on context and available translations
   */
  const getPage: CMSService['getPage'] = async ({ pagePath }) => {
    let pageData: Await<ReturnType<typeof fetchPage>>;

    try {
      pageData = await fetchPage(pagePath, context.i18n.locale);
    } catch (err: any) {
      if (err.message === 'noData') {
        console.info('No data in the requested locale. Falling back to default locale.');
        pageData = await fetchPage(pagePath, context.i18n.defaultLocale);
      } else {
        throw err;
      }
    }

    return pageData;
  };

  const getNews: CMSService['getNews'] = async ({ limit, page, domainId, withImageOnly }) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    let domainFilter: any;
    if (domainId) {
      domainFilter = {
        domains: { domains_id: { id: { _eq: domainId } } },
      };
    }

    let imageFilter: any;
    if (withImageOnly) {
      imageFilter = { main_image: { _nnull: true } };
    }

    const filter: any = { _and: [publishedFilter] };
    if (domainFilter) {
      filter._and.push(domainFilter);
    }
    if (imageFilter) {
      filter._and.push(imageFilter);
    }

    const newsResponse = await context.$directus.items('news').readMany({
      meta: 'filter_count',
      limit,
      page,
      filter,
      fields: [
        'id',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'domains.domains_id.id',
        'domains.domains_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        domains: { domains_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
      sort: ['-date_created'],
    });

    let totalNewsEntries = 0;
    if (newsResponse?.meta?.filter_count) {
      totalNewsEntries = newsResponse.meta.filter_count;
    }

    let newsList = [];
    if (!newsResponse?.data) {
      throw new Error('Error when retrieving news');
    }

    newsList = newsResponse.data.reduce((news, directusNewsEntry) => {
      if (!directusNewsEntry) {
        return news;
      }

      const translatedFields = getTranslatedFields(directusNewsEntry, currentLocale);

      if (!directusNewsEntry.id || !directusNewsEntry.date_created || !translatedFields?.title) {
        console.warn(`News entry with ID ${directusNewsEntry.id} is missing requested fields`);
        return news;
      }

      const newsEntry: NewsEntry = {
        id: directusNewsEntry.id,
        title: translatedFields.title,
        slug: translatedFields.slug,
        date_created: directusNewsEntry.date_created,
        date_updated: directusNewsEntry.date_updated,
        domains: [],
      };

      if (directusNewsEntry.main_image && directusNewsEntry.main_image.id) {
        newsEntry.main_image = {
          id: directusNewsEntry.main_image.id,
          description: directusNewsEntry.main_image.description,
        };
      }

      if (directusNewsEntry.domains) {
        newsEntry.domains = directusNewsEntry.domains.reduce((domains, domain) => {
          if (!domain?.domains_id) {
            return domains;
          }

          const translatedFields = getTranslatedFields(domain.domains_id);

          if (!translatedFields?.name) {
            return domains;
          }

          return [
            ...domains,
            {
              id: domain.domains_id.id,
              name: translatedFields.name,
            } as any /* Workaround until we have the news in the store as well */,
          ];
        }, [] as Domain[]);
      }

      return [...news, newsEntry];
    }, [] as NewsEntry[]);

    let filteredDomainName;
    if (domainId) {
      const filteredDomain = newsList[0].domains.find((domain) => domain.id === domainId);
      if (filteredDomain) {
        filteredDomainName = filteredDomain.name;
      }
    }

    return {
      data: newsList,
      meta: {
        total: totalNewsEntries,
        filteredDomainName,
      },
    };
  };

  // FIXME: `getOneNews` is almost identical to `getNews`. Make it more DRY.
  const getOneNews: CMSService['getOneNews'] = async (newsId) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const directusNewsEntry = await context.$directus.items('news').readOne(newsId, {
      fields: [
        'id',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.body',
        'domains.domains_id.id',
        'domains.domains_id.name',
        'domains.domains_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        domains: { domains_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
    });

    if (!directusNewsEntry) {
      throw new Error('Error when retrieving news');
    }

    const translatedFields = getTranslatedFields(directusNewsEntry, currentLocale);

    if (
      !directusNewsEntry.id ||
      !directusNewsEntry.date_created ||
      !translatedFields?.title ||
      !translatedFields?.body
    ) {
      throw new Error(`News entry is missing requested fields`);
    }

    const newsEntry: NewsEntry = {
      id: directusNewsEntry.id,
      title: translatedFields.title,
      slug: translatedFields.slug,
      body: translatedFields.body,
      date_created: directusNewsEntry.date_created,
      date_updated: directusNewsEntry.date_updated,
      domains: [],
    };

    if (directusNewsEntry.main_image && directusNewsEntry.main_image.id) {
      newsEntry.main_image = {
        id: directusNewsEntry.main_image.id,
        description: directusNewsEntry.main_image.description,
      };
    }

    if (directusNewsEntry.domains) {
      newsEntry.domains = directusNewsEntry.domains.reduce((domains, domain) => {
        if (!domain?.domains_id) {
          return domains;
        }

        const translatedFields = getTranslatedFields(domain.domains_id);

        if (!translatedFields?.name) {
          return domains;
        }

        return [
          ...domains,
          {
            id: domain.domains_id.id,
            name: translatedFields.name,
          } as any /* Workaround until we have the news in the store as well */,
        ];
      }, [] as Domain[]);
    }

    return newsEntry;
  };

  const getEvents: CMSService['getEvents'] = async ({ limit, page, typeId, month, upcoming, excludeCancelled }) => {
    const currentLocale = context.i18n.locale;

    // Preparing the filter to retrieve the events
    const publishedFilter = {
      _and: [
        {
          status: {
            _neq: 'draft',
          },
        },
      ],
    };

    if (excludeCancelled) {
      publishedFilter._and.push({
        status: {
          _neq: 'cancelled',
        },
      });
    }

    let typeFilter: any;
    if (typeId) {
      typeFilter = {
        type: { id: { _eq: typeId } },
      };
    }

    let monthFilter: any;
    if (month) {
      monthFilter = {
        _and: [
          {
            date_start: {
              _gte: month,
            },
          },
          {
            date_start: {
              // It doesn't matter if not all months have 31 days. The filter still does the job as expected.
              _lte: month + '-31',
            },
          },
        ],
      };
    }

    let upcomingFilter: any;
    if (upcoming) {
      upcomingFilter = {
        date_start: {
          _gte: new Date().toISOString(),
        },
      };
    }

    const filter: any = { _and: [publishedFilter] };
    if (typeFilter) {
      filter._and.push(typeFilter);
    }
    if (monthFilter) {
      filter._and.push(monthFilter);
    }
    if (upcomingFilter) {
      filter._and.push(upcomingFilter);
    }

    const response = await context.$directus.items('events').readMany({
      meta: 'filter_count',
      limit,
      page,
      filter,
      fields: [
        'id',
        'translations.name',
        'translations.description',
        'date_start',
        'time_start',
        'date_end',
        'time_end',
        'status',
        'venue.id',
        'venue.name',
        'venue.city',
        'venue.address',
        'venue_other',
        'image.id',
        'image.description',
        'url',
        'type',
      ],
    });

    let totalEvents = 0;
    if (response?.meta?.filter_count) {
      totalEvents = response.meta.filter_count;
    }

    let events = [];
    if (!response?.data) {
      throw new Error('Error when retrieving events');
    }

    events = response.data.reduce((events, directusEvent) => {
      const translatedFields = getTranslatedFields(directusEvent, currentLocale);
      if (!directusEvent?.date_start || !translatedFields?.name) {
        return events;
      }

      let isFullDay = true;
      let showEndTime = false;

      let startDate = new Date(directusEvent.date_start);
      if (directusEvent.time_start) {
        const startTime = directusEvent.time_start.split(':').map((t) => parseInt(t));
        startDate = set(startDate, { hours: startTime[0], minutes: startTime[1] });
        isFullDay = false;
      }

      let endDate: Date;
      if (directusEvent.date_end) {
        endDate = new Date(directusEvent.date_end);
      } else {
        endDate = startDate;
      }
      if (!isFullDay && directusEvent.time_end) {
        const endTime = directusEvent.time_end.split(':').map((t) => parseInt(t));
        endDate = set(endDate, { hours: endTime[0], minutes: endTime[1] });
        showEndTime = true;
      }

      let venue: Venue | undefined;
      if (directusEvent.venue) {
        venue = directusEvent.venue;
      } else if (directusEvent.venue_other) {
        venue = {
          name: directusEvent.venue_other,
        };
      }

      const event: CalendarEvent = {
        ...(directusEvent as any),
        name: translatedFields.name,
        description: translatedFields.description,
        date_start: startDate,
        date_end: endDate,
        isFullDay,
        showEndTime,
        venue,
      };

      return [...events, event];
    }, [] as CalendarEvent[]);

    return {
      data: events,
      meta: {
        total: totalEvents,
      },
    };
  };

  const getTeam: CMSService['getTeam'] = async (teamSlug) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const teamResponse = await context.$directus.items('national_teams').readMany({
      limit: 1,
      filter: {
        translations: {
          // @ts-ignore This should be accepted. To be fixed in Directus SDK
          slug: { _eq: teamSlug },
        },
      },
      fields: [
        'gender',
        'translations.name',
        'translations.slug',
        'players.id',
        'players.first_name',
        'players.last_name',
        'players.number',
        'players.is_captain',
        'players.birth_year',
        'players.gender',
        'players.club.name',
        'players.positions.player_positions_id',
        'players.date_start',
        'players.date_end',
        'players.track_record',
        'players.portrait_square_head',
        'staff.roles_id.id',
        'staff.roles_id.translations.name',
        'staff.roles_id.translations.name_feminine',
        'staff.roles_id.translations.name_masculine',
        'staff.roles_id.holders.people_id.id',
        'staff.roles_id.holders.people_id.first_name',
        'staff.roles_id.holders.people_id.last_name',
        'staff.roles_id.holders.people_id.gender',
        'staff.roles_id.holders.people_id.email',
        'staff.roles_id.holders.people_id.portrait_square_head',
        'results.competition_id.year',
        'results.competition_id.logo',
        'results.competition_id.translations.languages_code',
        'results.competition_id.translations.name',
        'results.competition_id.translations.city',
        'results.competition_id.translations.country',
        'results.ranking',
        'nations_cup_results',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
        // @ts-ignore Bug with Directus SDK, it should accept roles_id here.
        staff: { roles_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
        // TODO: uncomment the filter below once the filter on date fields is fixed https://github.com/directus/directus/issues/6494
        // players: {
        //   // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        //   _filter: {
        //     _or: [{ date_end: { _gte: context.$formatDate(new Date(), 'yyyy-MM-dd') } }, { date_end: { _null: true } }],
        //   },
        // },
      },
    });

    if (!teamResponse?.data) {
      throw new Error('Error when retrieving team');
    }

    const rawTeam = teamResponse.data[0];

    if (!rawTeam) {
      throw new Error('No team found');
    }

    let players: any[] = [];
    if (rawTeam.players) {
      players = rawTeam.players.map((player) => {
        if (player?.positions) {
          return {
            ...player,
            positions: player.positions.map((position) => {
              if (position) {
                return position.player_positions_id;
              }
              return position;
            }),
          };
        }
        return player;
      });
    }

    // We sort the players because the API can't do it yet (only at the root)
    // Captain first, then alphabetically by last name, and then first name.
    players = players.sort(
      (playerA, playerB) =>
        playerB.is_captain - playerA.is_captain ||
        playerA.last_name.localeCompare(playerB.last_name) ||
        playerA.first_name.localeCompare(playerB.first_name)
    );

    // We sort the results because the API can't do it yet (only at the root)
    let results: NationalTeamResult[] =
      rawTeam.results?.map((result) => {
        if (!result?.competition_id) {
          console.warn('Unknown competition for team result');
          return result;
        }

        const competitionTranslations = getTranslatedFields(result.competition_id, currentLocale);

        if (!competitionTranslations?.name) {
          console.warn('Competition has no name', result.competition_id);
          return result;
        }

        return {
          competition: {
            ...result?.competition_id,
            name: competitionTranslations.name,
            city: competitionTranslations.city,
            country: competitionTranslations.country,
          },
          ranking: result?.ranking,
        } as any;
      }) || [];
    results = results.sort((resultA, resultB) => resultB.competition.year - resultA.competition.year);

    // Fallback for mandatory fields
    const team = {
      name: 'No name',
      slug: 'unknown',
      gender: rawTeam.gender || 'mixed',
      players,
      staff: [] as number[],
      results,
      nationsCupResults: (rawTeam.nations_cup_results as any) || {},
    };

    const teamTranslations = getTranslatedFields(rawTeam);
    if (!teamTranslations?.name || !teamTranslations?.slug) {
      throw new Error('Team is missing requested fields');
    }
    team.name = teamTranslations.name || team.name;
    team.slug = teamTranslations.slug || team.slug;

    if (rawTeam.staff) {
      // We save the roles in the store and only provide the role IDs with the page data
      team.staff.push(...(rawTeam.staff.map((teamRole) => teamRole?.roles_id?.id) as number[]));
      Role.addManyFromDirectus(rawTeam.staff.map((teamRole) => teamRole?.roles_id) as PartialItem<DirectusRole>[]);
    }

    const today = new Date();

    // Manually filtering players until the API filter on date fields is fixed https://github.com/directus/directus/issues/6494
    team.players = team.players.filter(
      (player: any) => player && (!player.date_end || player.date_end >= context.$formatDate(today, 'yyyy-MM-dd'))
    );

    return team;
  };

  const getSeasons: CMSService['getSeasons'] = async () => {
    const seasonsResponse = await context.$directus.items('seasons').readMany({
      fields: ['id', 'name', 'slug', 'date_start', 'date_end', 'leverade_id'],
    });

    if (!seasonsResponse?.data) {
      throw new Error('Error when retrieving seasons');
    }

    const seasons = seasonsResponse.data.reduce((seasons, season) => {
      // We discard seasons that don't have mandatory data.
      if (season.id && season.name && season.slug && season.date_start && season.date_end) {
        return [
          ...seasons,
          {
            id: season.id,
            name: season.name,
            slug: season.slug,
            date_start: season.date_start,
            date_end: season.date_end,
            leverade_id: season.leverade_id,
          },
        ];
      }
      console.warn('Season missing mandatory data', { season });
      return seasons;
    }, [] as DirectusSeason[]);

    return seasons;
  };

  const getNationalCompetition: CMSService['getNationalCompetition'] = async (competitionSlug) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const response = await context.$directus.items('national_competitions').readMany({
      limit: 1,
      filter: {
        translations: {
          // @ts-ignore This should be accepted. To be fixed in Directus SDK
          slug: { _eq: competitionSlug },
        },
      },
      fields: [
        'id',
        'translations.name',
        'translations.slug',
        'editions.season.name',
        'editions.season.slug',
        'editions.leverade_id',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
      },
    });

    if (!response?.data) {
      throw new Error('Error when retrieving competition');
    }

    const rawCompetition = response.data[0];

    if (!rawCompetition || !rawCompetition.id) {
      throw new Error('No competition found');
    }
    const translatedFields = getTranslatedFields(rawCompetition);

    if (!translatedFields?.name || !translatedFields?.slug) {
      throw new Error('Competition is missing requested fields');
    }

    // Fallback for mandatory fields should not happen as we requested those fields
    return {
      id: rawCompetition.id,
      name: translatedFields.name,
      slug: translatedFields.slug,
      editions: (rawCompetition.editions as any) || [],
    };
  };

  const getNationalCompetitionEditions: CMSService['getNationalCompetitionEditions'] = async ({
    competitionSlug,
    seasonSlug,
    leveradeIds,
  }) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    let filter: Filter<DirectusNationalCompetitionEdition> = {};

    if (leveradeIds) {
      filter = {
        leverade_id: {
          _in: leveradeIds.map((id) => parseInt(id)),
        },
      };
    } else {
      filter = {
        _and: [],
      };
      if (competitionSlug) {
        filter._and.push({
          competition: {
            translations: {
              // @ts-ignore This should be accepted. To be fixed in Directus SDK
              slug: { _eq: competitionSlug },
            },
          },
        });
      }
      if (seasonSlug) {
        filter._and.push({
          season: {
            slug: { _eq: seasonSlug },
          },
        });
      }
    }

    const response = await context.$directus.items('national_competition_editions').readMany({
      filter,
      fields: [
        'id',
        'season.id',
        'season.name',
        'season.slug',
        'season.date_start',
        'season.date_end',
        'season.leverade_id',
        'competition.id',
        'competition.translations.name',
        'competition.translations.slug',
        'leverade_id',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        competition: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
      },
    });

    if (!response?.data) {
      throw new Error('Error when retrieving competition edition');
    }

    return response.data.reduce((editions, rawEdition) => {
      if (!rawEdition.competition) {
        return editions;
      }

      const translatedCompetitionFields = getTranslatedFields(rawEdition.competition);

      if (
        !rawEdition.id ||
        !rawEdition.season?.id ||
        !rawEdition.season?.name ||
        !rawEdition.season?.slug ||
        !rawEdition.season?.date_start ||
        !rawEdition.season?.date_end ||
        !rawEdition.season?.leverade_id ||
        !rawEdition.competition.id ||
        !translatedCompetitionFields?.name ||
        !translatedCompetitionFields?.slug ||
        !rawEdition.leverade_id
      ) {
        return editions;
      }

      return [
        ...editions,
        {
          directus_id: rawEdition.id,
          season: {
            id: rawEdition.season.id,
            name: rawEdition.season.name,
            slug: rawEdition.season.slug,
            date_start: rawEdition.season.date_start,
            date_end: rawEdition.season.date_end,
            leverade_id: rawEdition.season.leverade_id,
          },
          competition: {
            id: rawEdition.competition.id,
            name: translatedCompetitionFields?.name,
            slug: translatedCompetitionFields?.slug,
          },
          leverade_id: rawEdition.leverade_id,
        },
      ];
    }, [] as NationalCompetitionEdition[]);
  };
  const searchResources: CMSService['searchResources'] = async (searchTerm, domainId, typeId) => {
    // We retrieve all the languages and show resources in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    // Type should be Filter<DirectusResourceType>, but there is a bug in the Directus SDK.
    // We use any as a workaround until the _and is properly recognised. See https://github.com/directus/directus/issues/7475
    const filter: any = {
      _and: [
        {
          status: { _eq: 'visible' },
        },
      ],
    };

    if (searchTerm) {
      // We use the filter because the search capability of Directus only work on root level items, not relations
      filter._and.push({
        _or: [
          {
            keywords: { _contains: searchTerm },
          },
          {
            translations: {
              name: { _contains: searchTerm },
            },
          },
        ],
      });
    }

    if (domainId) {
      filter._and.push({
        domains: { domains_id: { _eq: domainId } },
      });
    }

    if (typeId) {
      filter._and.push({
        type: { _eq: typeId },
      });
    }

    const response = await context.$directus.items('resources').readMany({
      filter,
      fields: [
        'id',
        'date',
        'type',
        'domains.domains_id',
        'translations.name',
        'translations.languages_code',
        'translations.file.id',
        'translations.file.type',
        'translations.file.filesize',
        'translations.file.filename_download',
        'translations.link',
      ],
    });

    if (!response.data) {
      throw new Error('Error when retrieving resources');
    }

    return response.data
      .reduce((resources, resource) => {
        if (!resource) {
          return resources;
        }
        const translatedFields = getTranslatedFields(resource, currentLocale);

        if (!translatedFields?.name) {
          return resources;
        }

        return [
          ...resources,
          {
            ...resource,
            name: translatedFields?.name,
            file: translatedFields?.file,
            link: translatedFields?.link,
          },
        ] as Resource[];
      }, [] as Resource[])
      .sort((resourceA, resourceB) => resourceA.name.localeCompare(resourceB.name));
  };

  inject('cmsService', {
    getPage,
    getNews,
    getOneNews,
    getEvents,
    getTeam,
    getSeasons,
    getNationalCompetition,
    getNationalCompetitionEditions,
    searchResources,
  });
};

export default cmsService;
