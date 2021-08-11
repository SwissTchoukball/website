<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">News</h2>
    <st-loader v-if="$fetchState.pending" class="c-news__loader" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else>
      <p v-if="filteredCategoryName" class="c-news__category-filter-info">
        {{ $t('news.categoryFilterInfo', { categoryName: filteredCategoryName }) }}
        <nuxt-link :to="''">{{ $t('news.showAll') }}</nuxt-link>
      </p>
      <st-news-list class="c-news__list" :news="newsList" />
    </template>
    <st-pagination v-if="totalPages" :current-page="currentPage" :total-pages="totalPages" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import stLoader from '~/components/st-loader.vue';
import stNewsList from '~/components/news/st-news-list.vue';
import { NewsEntry } from '~/components/news/st-news';
import { DirectusNewsCategory, flattenForLanguage } from '~/plugins/directus';
import StPagination from '~/components/st-pagination.vue';

export default Vue.extend({
  components: { stLoader, stNewsList, StPagination },
  data() {
    return {
      newsList: [] as NewsEntry[],
      newsEntriesPerPage: 12,
      totalNewsEntries: undefined as number | undefined,
      filteredCategoryName: undefined as string | undefined,
    };
  },
  async fetch() {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = this.$i18n.locale;
    const defaultLocale = this.$i18n.defaultLocale;

    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };
    let categoryFilter: any;
    let filteredCategoryId: number | undefined;
    if (typeof this.$route.query.category === 'string') {
      filteredCategoryId = parseInt(this.$route.query.category);
      categoryFilter = {
        categories: { id: { _eq: filteredCategoryId } },
      };
    }
    let filter: any = {};
    if (categoryFilter) {
      filter = { _and: [publishedFilter, categoryFilter] };
    } else {
      filter = publishedFilter;
    }

    const newsResponse = await this.$directus.items('news').readMany({
      meta: 'filter_count',
      limit: this.newsEntriesPerPage,
      page: this.currentPage,
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

    if (newsResponse?.meta?.filter_count) {
      this.totalNewsEntries = newsResponse.meta.filter_count;
    }

    if (newsResponse?.data) {
      this.newsList = newsResponse.data.reduce((news, directusNewsEntry) => {
        let singleLanguageNewsEntry:
          | (Omit<NewsEntry, 'categories'> & { categories: DirectusNewsCategory[] })
          | undefined;
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

      this.filteredCategoryName = undefined;
      if (filteredCategoryId) {
        const filteredCategory = this.newsList[0].categories.find((category) => category.id === filteredCategoryId);
        if (filteredCategory) {
          this.filteredCategoryName = filteredCategory.name;
        }
      }
    }
  },
  computed: {
    totalPages(): number | undefined {
      if (!this.totalNewsEntries) {
        return;
      }
      return Math.ceil(this.totalNewsEntries / this.newsEntriesPerPage);
    },
    currentPage(): number {
      if (this.$route.query.page && typeof this.$route.query.page === 'string') {
        return parseInt(this.$route.query.page);
      }

      return 1;
    },
  },
  watch: {
    '$route.query': '$fetch',
  },
});
</script>

<style>
.c-news__loader {
  margin: auto;
  margin-top: var(--st-length-spacing-m);
}

.c-news__category-filter-info {
  margin-top: var(--st-length-spacing-xs);
}

.c-news__list {
  margin-top: var(--st-length-spacing-m);
}
</style>
