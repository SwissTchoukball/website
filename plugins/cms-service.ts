import { Plugin } from '@nuxt/types';
import { PartialItem } from '@directus/sdk';
import { set } from 'date-fns';
import { NewsEntry } from '~/components/news/st-news';
import { DirectusNewsCategory } from '~/plugins/directus';

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

interface CMSService {
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
  }) => Promise<{ data: CalendarEvent[]; meta: { total: number; filteredCategoryName?: string } }>;
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

  const getEvents: CMSService['getEvents'] = async ({ limit, page, categoryId, month }) => {
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

    const filter: any = { _and: [publishedFilter] };
    if (categoryFilter) {
      filter._and.push(categoryFilter);
    }
    if (monthFilter) {
      filter._and.push(monthFilter);
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

  inject('cmsService', { getNews, getOneNews, getEvents });
};

export default cmsService;
