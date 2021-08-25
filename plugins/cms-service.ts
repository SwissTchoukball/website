import { Plugin } from '@nuxt/types';
import { PartialItem } from '@directus/sdk';
import { set } from 'date-fns';
import { DirectusNewsCategory } from '~/plugins/directus';
import { NewsEntry } from '~/components/news/st-news';
import { NationalTeam, NationalTeamResult } from '~/components/national-teams/st-national-teams.prop';
import { Season } from '~/store/state';

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
  category: number;
}

interface NationalCompetitionEdition {
  directus_id: number;
  season: Season;
  competition: number;
  leverade_id?: number;
}

interface NationalCompetition {
  id: number;
  name: string;
  slug: string;
  editions: NationalCompetitionEdition[];
}

export interface CMSService {
  getNews: (options: {
    limit: number;
    page: number;
    categoryId?: number;
    withImageOnly?: boolean;
  }) => Promise<{ data: NewsEntry[]; meta: { total: number; filteredCategoryName?: string } }>;
  getOneNews: (newsId: number) => Promise<NewsEntry>;
  getEvents: (options: {
    limit: number;
    page: number;
    categoryId?: number;
    month?: string;
    upcoming?: boolean;
  }) => Promise<{ data: CalendarEvent[]; meta: { total: number; filteredCategoryName?: string } }>;
  getTeam: (teamSlug: string) => Promise<NationalTeam>;
  getSeasons: () => Promise<Season[]>;
  getNationalCompetition: (competitionSlug: string) => Promise<NationalCompetition>;
  getNationalCompetitionEdition: (competitionSlug: string, seasonSlug: string) => Promise<NationalCompetitionEdition>;
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
  const flattenForLanguage = (
    dataEntry: PartialItem<{ [x: string]: any; translations: { languages_code: string; [y: string]: any }[] }>,
    languageCode: string
  ) => {
    if (!dataEntry.translations) {
      throw new Error(`No translations`);
    }
    const requestedTranslation = dataEntry.translations.find(
      (translation) => translation?.languages_code && translation.languages_code === languageCode
    );
    if (!requestedTranslation) {
      throw new Error(`No ${languageCode} translation available`);
    }
    const flattenDataEntry: any = {
      ...dataEntry,
      ...requestedTranslation,
    };
    flattenDataEntry.translations = undefined;
    return flattenDataEntry;
  };

  const getNews: CMSService['getNews'] = async ({ limit, page, categoryId, withImageOnly }) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const defaultLocale = context.i18n.defaultLocale;

    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    let categoryFilter: any;
    if (categoryId) {
      categoryFilter = {
        categories: { id: { _eq: categoryId } },
      };
    }

    let imageFilter: any;
    if (withImageOnly) {
      imageFilter = { main_image: { _nnull: true } };
    }

    const filter: any = { _and: [publishedFilter] };
    if (categoryFilter) {
      filter._and.push(categoryFilter);
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
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'categories.id',
        'categories.news_categories_id.translations.slug',
        'categories.news_categories_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        categories: { news_categories_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
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
      let singleLanguageNewsEntry: (Omit<NewsEntry, 'categories'> & { categories: DirectusNewsCategory[] }) | undefined;
      if (directusNewsEntry && directusNewsEntry.translations?.length) {
        try {
          singleLanguageNewsEntry = flattenForLanguage(directusNewsEntry, currentLocale);
        } catch (error) {
          console.warn(
            `News entry ${directusNewsEntry.id} is not available in ${currentLocale}. Falling back to default.`
          );
          try {
            singleLanguageNewsEntry = flattenForLanguage(directusNewsEntry, defaultLocale);
          } catch (error) {
            console.warn(
              `News entry ${directusNewsEntry.id} is not available in default locale ${defaultLocale}. Discarding news entry for display.`
            );
          }
        }

        if (!singleLanguageNewsEntry) {
          return news;
        }

        // For categories, we expect them to be all translated, so we don't fallback to default locale.
        const newsEntry: NewsEntry = {
          ...singleLanguageNewsEntry,
          categories: singleLanguageNewsEntry.categories.map((category) => ({
            id: category.id,
            ...category.news_categories_id.translations[0],
          })),
        };

        return [...news, newsEntry];
      }
      return news;
    }, [] as NewsEntry[]);

    let filteredCategoryName;
    if (categoryId) {
      const filteredCategory = newsList[0].categories.find((category) => category.id === categoryId);
      if (filteredCategory) {
        filteredCategoryName = filteredCategory.name;
      }
    }

    return {
      data: newsList,
      meta: {
        total: totalNewsEntries,
        filteredCategoryName,
      },
    };
  };

  const getOneNews: CMSService['getOneNews'] = async (newsId) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const defaultLocale = context.i18n.defaultLocale;
    const newsEntryResponse = await context.$directus.items('news').readOne(newsId, {
      fields: [
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.body',
        'categories.id',
        'categories.news_categories_id.translations.slug',
        'categories.news_categories_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        categories: { news_categories_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
    });

    if (!newsEntryResponse) {
      throw new Error('Error when retrieving news');
    }

    if (!newsEntryResponse.translations?.length) {
      throw new Error('News has no translations');
    }

    let singleLanguageNewsEntry: (Omit<NewsEntry, 'categories'> & { categories: DirectusNewsCategory[] }) | undefined;
    try {
      singleLanguageNewsEntry = flattenForLanguage(newsEntryResponse, currentLocale);
    } catch (error) {
      console.warn(`News entry ${newsEntryResponse.id} is not available in ${currentLocale}. Falling back to default.`);
      try {
        singleLanguageNewsEntry = flattenForLanguage(newsEntryResponse, defaultLocale);
      } catch (error) {
        throw new Error('News entry not available in default locale');
      }
    }

    if (!singleLanguageNewsEntry) {
      // Should not happen because if not set above, an error is thrown.
      throw new Error('Unexpected error when processing news entry');
    }

    // For categories, we expect them to be all translated, so we don't fallback to default locale.
    return {
      ...singleLanguageNewsEntry,
      categories: singleLanguageNewsEntry.categories.map((category) => ({
        id: category.id,
        ...category.news_categories_id.translations[0],
      })),
    };
  };

  const getEvents: CMSService['getEvents'] = async ({ limit, page, categoryId, month, upcoming }) => {
    // Preparing the filter to retrieve the events
    const publishedFilter = {
      status: {
        _neq: 'draft',
      },
    };

    let categoryFilter: any;
    if (categoryId) {
      categoryFilter = {
        categories: { id: { _eq: categoryId } },
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
    if (categoryFilter) {
      filter._and.push(categoryFilter);
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
        'category',
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
    // const defaultLocale = context.i18n.defaultLocale;
    const teamResponse = await context.$directus.items('national_teams').readMany({
      limit: 1,
      filter: {
        _or: [
          {
            slug: { _eq: teamSlug },
          },
          {
            translations: {
              slug: { _eq: teamSlug },
            },
          },
        ],
      } as any, // Workaround until the _or is properly recognised. See https://github.com/directus/directus/issues/7475
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
      fields: ['name', 'slug', 'leverade_id'],
    });

    if (!seasonsResponse?.data) {
      throw new Error('Error when retrieving seasons');
    }

    const seasons = seasonsResponse.data.reduce((seasons, season) => {
      // We discard seasons that don't have mandatory data.
      if (season.id && season.name && season.slug) {
        return [
          ...seasons,
          {
            id: season.id,
            name: season.name,
            slug: season.slug,
            leverade_id: season.leverade_id,
          },
        ];
      }
      console.warn('Season missing mandatory data', { season });
      return seasons;
    }, [] as Season[]);

    return seasons;
  };

  const getNationalCompetition: CMSService['getNationalCompetition'] = async (competitionSlug) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    // const defaultLocale = context.i18n.defaultLocale;
    const response = await context.$directus.items('national_competitions').readMany({
      limit: 1,
      filter: {
        _or: [
          {
            slug: { _eq: competitionSlug },
          },
          {
            translations: {
              slug: { _eq: competitionSlug },
            },
          },
        ],
      } as any, // Workaround until the _or is properly recognised. See https://github.com/directus/directus/issues/7475
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

    // Because we requested data for a specific language, `translations` contain only the language we need
    let translatedFields;
    if (rawCompetition.translations && rawCompetition.translations[0]) {
      translatedFields = rawCompetition.translations[0];
    }

    // Fallback for mandatory fields should not happen as we requested those fields
    return {
      id: rawCompetition.id,
      name: translatedFields?.name || rawCompetition.name || 'No name',
      slug: translatedFields?.slug || rawCompetition.slug || 'unknown',
      editions: (rawCompetition.editions as any) || [],
    };
  };

  const getNationalCompetitionEdition: CMSService['getNationalCompetitionEdition'] = async (
    competitionSlug,
    seasonSlug
  ) => {
    const response = await context.$directus.items('national_competition_editions').readMany({
      limit: 1,
      filter: {
        _and: [
          {
            _or: [
              {
                competition: {
                  slug: { _eq: competitionSlug },
                },
              },
              {
                competition: {
                  translations: { slug: { _eq: competitionSlug } },
                },
              },
            ],
          },
          {
            season: {
              slug: { _eq: seasonSlug },
            },
          },
        ],
      } as any, // Workaround until the _or is properly recognised. See https://github.com/directus/directus/issues/7475
      fields: ['id', 'season.id', 'season.name', 'season.slug', 'competition', 'leverade_id'],
    });

    if (!response?.data) {
      throw new Error('Error when retrieving competition edition');
    }

    const rawCompetitionEdition = response.data[0];

    if (!rawCompetitionEdition) {
      throw new Error('No competition edition found');
    }

    if (
      !rawCompetitionEdition.id ||
      !rawCompetitionEdition.season?.id ||
      !rawCompetitionEdition.season?.name ||
      !rawCompetitionEdition.season?.slug ||
      !rawCompetitionEdition.competition
    ) {
      throw new Error('Missing data in competition edition');
    }

    // Fallback for mandatory fields should not happen as we requested those fields
    return {
      directus_id: rawCompetitionEdition.id,
      season: {
        id: rawCompetitionEdition.season.id,
        name: rawCompetitionEdition.season.name,
        slug: rawCompetitionEdition.season.slug,
      },
      competition: rawCompetitionEdition.competition,
      leverade_id: rawCompetitionEdition.leverade_id,
    };
  };

  inject('cmsService', {
    getNews,
    getOneNews,
    getEvents,
    getTeam,
    getSeasons,
    getNationalCompetition,
    getNationalCompetitionEdition,
  });
};

export default cmsService;
