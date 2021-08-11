import { Plugin } from '@nuxt/types';
import { PartialItem } from '@directus/sdk';
import { NewsEntry } from '~/components/news/st-news';
import { DirectusNewsCategory } from '~/plugins/directus';

interface CMSService {
  getNews: (options: {
    limit: number;
    page: number;
    categoryId?: number;
    withImageOnly?: boolean;
  }) => Promise<{ data: NewsEntry[]; meta: { total: number; filteredCategoryName?: string } }>;
  getOneNews: (newsId: number) => Promise<NewsEntry>;
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

  inject('cmsService', { getNews, getOneNews });
};

export default cmsService;
