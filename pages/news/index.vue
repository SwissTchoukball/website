<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">News</h2>
    <!-- TODO: Add info about filtered category -->
    <st-loader v-if="$fetchState.pending" class="c-news__loader" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <st-news-list v-else class="c-news__list" :news="newsList" />
    <!-- TODO: Add pagination -->
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import stLoader from '~/components/st-loader.vue';
import stNewsList from '~/components/news/st-news-list.vue';
import { NewsEntry } from '~/components/news/st-news';
import { DirectusNewsCategory, flattenForLanguage } from '~/plugins/directus';

export default Vue.extend({
  components: { stLoader, stNewsList },
  data() {
    return {
      newsList: [] as NewsEntry[],
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
    if (this.$route.query.category) {
      categoryFilter = {
        categories: { id: { _eq: this.$route.query.category } },
      };
    }
    let filter: any = {};
    if (categoryFilter) {
      filter = { _and: [publishedFilter, categoryFilter] };
    } else {
      filter = publishedFilter;
    }

    const newsResponse = await this.$directus.items('news').readMany({
      limit: 10,
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
    }
  },
  watch: {
    '$route.query.category': '$fetch',
  },
});
</script>

<style>
.c-news__loader {
  margin: auto;
  margin-top: var(--st-length-spacing-m);
}

.c-news__list {
  margin-top: var(--st-length-spacing-m);
}
</style>
