import { Plugin } from '@nuxt/types';
import { set } from 'date-fns';
import { Filter } from '@directus/sdk';
import { DirectusNationalCompetitionEdition, DirectusSeason, getTranslatedFields } from '~/plugins/directus';
import { NewsEntry } from '~/components/news/st-news';
import { NationalTeam, NationalTeamResult } from '~/components/national-teams/st-national-teams.prop';
import Domain from '~/models/domain.model';

export interface Venue {
  name: string;
  address?: string;
  url?: string;
}
export interface CalendarEvent {
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

export interface Resource {
  id: number;
  date?: string;
  name: string;
  file?: {
    id: number;
    type: string;
    filesize: number;
    filename_download: string;
  };
  link?: string;
  type: number;
  domains: number[];
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
  const getNews: CMSService['getNews'] = async ({ limit, page, domainId, withImageOnly }) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    let domaniFilter: any;
    if (domainId) {
      domaniFilter = {
        domains: { id: { _eq: domainId } },
      };
    }

    let imageFilter: any;
    if (withImageOnly) {
      imageFilter = { main_image: { _nnull: true } };
    }

    const filter: any = { _and: [publishedFilter] };
    if (domaniFilter) {
      filter._and.push(domaniFilter);
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
        'title',
        'slug',
        'body',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'domains.id',
        'domains.domains_id.name',
        'domains.domains_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
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

      if (
        !directusNewsEntry.id ||
        !directusNewsEntry.title ||
        !directusNewsEntry.body ||
        !directusNewsEntry.date_created
      ) {
        console.warn(`News entry with ID ${directusNewsEntry.id} is missing requested fields`);
        return news;
      }

      const translatedFields = getTranslatedFields(directusNewsEntry);

      const newsEntry: NewsEntry = {
        id: directusNewsEntry.id,
        title: translatedFields?.title || directusNewsEntry.title,
        slug: translatedFields?.slug || directusNewsEntry.slug,
        body: translatedFields?.body || directusNewsEntry.body,
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
          if (!domain || !domain.domains_id) {
            return domains;
          }

          const translatedFields = getTranslatedFields(domain.domains_id);

          return [
            ...domains,
            {
              id: domain.id,
              name: translatedFields?.name || domain.domains_id.name,
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
        'title',
        'slug',
        'body',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.body',
        'domains.id',
        'domains.domains_id.name',
        'domains.domains_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        domains: { domains_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
    });

    if (!directusNewsEntry) {
      throw new Error('Error when retrieving news');
    }

    if (
      !directusNewsEntry.id ||
      !directusNewsEntry.title ||
      !directusNewsEntry.body ||
      !directusNewsEntry.date_created
    ) {
      throw new Error(`News entry is missing requested fields`);
    }

    const translatedFields = getTranslatedFields(directusNewsEntry);

    const newsEntry: NewsEntry = {
      id: directusNewsEntry.id,
      title: translatedFields?.title || directusNewsEntry.title,
      slug: translatedFields?.slug || directusNewsEntry.slug,
      body: translatedFields?.body || directusNewsEntry.body,
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
        if (!domain || !domain.domains_id) {
          return domains;
        }

        const translatedFields = getTranslatedFields(domain.domains_id);

        return [
          ...domains,
          {
            id: domain.id,
            name: translatedFields?.name || domain.domains_id.name,
          } as any /* Workaround until we have the news in the store as well */,
        ];
      }, [] as Domain[]);
    }

    return newsEntry;
  };

  const getEvents: CMSService['getEvents'] = async ({ limit, page, typeId, month, upcoming }) => {
    // Preparing the filter to retrieve the events
    const publishedFilter = {
      status: {
        _neq: 'draft',
      },
    };

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
        'name',
        'date_start',
        'time_start',
        'date_end',
        'time_end',
        'status',
        'description',
        'venue.id',
        'venue.name',
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
      if (!directusEvent || !directusEvent.name || !directusEvent.date_start) {
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
        _or: [
          {
            slug: { _eq: teamSlug },
          },
          {
            translations: {
              // @ts-ignore This should be accepted. To be fixed in Directus SDK
              slug: { _eq: teamSlug },
            },
          },
        ],
      },
      fields: [
        'name',
        'slug',
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
        'staff.national_team_staff_id.id',
        'staff.national_team_staff_id.first_name',
        'staff.national_team_staff_id.last_name',
        'staff.national_team_staff_id.gender',
        'staff.national_team_staff_id.role',
        'staff.national_team_staff_id.date_start',
        'staff.national_team_staff_id.date_end',
        'staff.national_team_staff_id.track_record',
        'staff.national_team_staff_id.portrait_square_head',
        'results.competition_id.name',
        'results.competition_id.year',
        'results.competition_id.logo',
        'results.competition_id.city',
        'results.competition_id.country',
        'results.ranking',
        'nations_cup_results',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
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
      rawTeam.results?.map(
        (r) =>
          ({
            competition: r?.competition_id,
            ranking: r?.ranking,
          } as any)
      ) || [];
    results = results.sort((resultA, resultB) => resultB.competition.year - resultA.competition.year);

    // Fallback for mandatory fields should not happen as we requested those fields
    const team = {
      name: rawTeam.name || 'No name',
      slug: rawTeam.slug || 'unknown',
      gender: rawTeam.gender || 'mixed',
      players,
      staff: (rawTeam.staff?.map((s) => s?.national_team_staff_id) as any) || [],
      results,
      nationsCupResults: (rawTeam.nations_cup_results as any) || {},
    };

    if (rawTeam.translations && rawTeam.translations[0]) {
      const translations = rawTeam.translations[0];
      team.name = translations.name || team.name;
      team.slug = translations.slug || team.slug;
    }

    const today = new Date();

    // Manually filtering players until the API filter on date fields is fixed https://github.com/directus/directus/issues/6494
    team.players = team.players.filter(
      (player: any) => player && (!player.date_end || player.date_end >= context.$formatDate(today, 'yyyy-MM-dd'))
    );

    // Manually filtering staff until the API filter on date fields is fixed https://github.com/directus/directus/issues/6494
    team.staff = team.staff.filter(
      (staffMember: any) =>
        staffMember && (!staffMember.date_end || staffMember.date_end >= context.$formatDate(today, 'yyyy-MM-dd'))
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
        _or: [
          {
            slug: { _eq: competitionSlug },
          },
          {
            translations: {
              // @ts-ignore This should be accepted. To be fixed in Directus SDK
              slug: { _eq: competitionSlug },
            },
          },
        ],
      },
      fields: [
        'id',
        'name',
        'slug',
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

    if (!rawCompetition.name || !rawCompetition.slug) {
      throw new Error('Competition is missing requested fields');
    }

    const translatedFields = getTranslatedFields(rawCompetition);

    // Fallback for mandatory fields should not happen as we requested those fields
    return {
      id: rawCompetition.id,
      name: translatedFields?.name || rawCompetition.name,
      slug: translatedFields?.slug || rawCompetition.slug,
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
          _or: [
            {
              competition: {
                slug: { _eq: competitionSlug },
              },
            },
            {
              competition: {
                translations: {
                  // @ts-ignore This should be accepted. To be fixed in Directus SDK
                  slug: { _eq: competitionSlug },
                },
              },
            },
          ],
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
        'competition.name',
        'competition.slug',
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
      if (
        !rawEdition.id ||
        !rawEdition.season?.id ||
        !rawEdition.season?.name ||
        !rawEdition.season?.slug ||
        !rawEdition.season?.date_start ||
        !rawEdition.season?.date_end ||
        !rawEdition.season?.leverade_id ||
        !rawEdition.competition?.id ||
        !rawEdition.competition?.name ||
        !rawEdition.competition?.slug ||
        !rawEdition.leverade_id
      ) {
        return editions;
      }

      const translatedCompetitionFields = getTranslatedFields(rawEdition.competition);

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
            name: translatedCompetitionFields?.name || rawEdition.competition.name,
            slug: translatedCompetitionFields?.slug || rawEdition.competition.slug,
          },
          leverade_id: rawEdition.leverade_id,
        },
      ];
    }, [] as NationalCompetitionEdition[]);
  };
  const searchResources: CMSService['searchResources'] = async (searchTerm, domainId, typeId) => {
    // Type should be Filter<DirectusResourceType>, but there is a bug in the Directus SDK.
    // We use any as a workaround until the _and is properly recognised. See https://github.com/directus/directus/issues/7475
    const filter: any = {
      _and: [
        {
          status: { _eq: 'visible' },
        },
      ],
    };

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
      search: searchTerm,
      filter,
      fields: [
        'id',
        'date',
        'name',
        'file.id',
        'file.type',
        'file.filesize',
        'file.filename_download',
        'link',
        'type',
        'domains.domains_id',
        'translations.name',
        'translations.file.id',
        'translations.file.type',
        'translations.file.filesize',
        'translations.file.filename_download',
        'translations.link',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: context.i18n.locale } } },
      },
      sort: ['name'],
    });

    if (!response.data) {
      throw new Error('Error when retrieving resources');
    }

    return response.data.reduce((resources, resource) => {
      if (!resource.name) {
        return resources;
      }
      const translatedFields = getTranslatedFields(resource);
      const temp = [
        ...resources,
        {
          ...resource,
          name: translatedFields?.name || resource.name,
          file: translatedFields?.file || resource.file,
          link: translatedFields?.link || resource.link,
        },
      ] as Resource[];
      return temp;
    }, [] as Resource[]);
  };

  inject('cmsService', {
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
