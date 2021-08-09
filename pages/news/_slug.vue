<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" class="c-news-entry__loader" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <st-news v-else :news-entry="newsEntry" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { NewsEntry } from '~/components/news/st-news';
import stNews from '~/components/news/st-news.vue';
import { DirectusNewsCategory, flattenForLanguage } from '~/plugins/directus';

export default Vue.extend({
  components: { stNews },
  data() {
    return {
      newsEntry: undefined as NewsEntry | undefined,
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    const id = slug.substr(0, slug.indexOf('-'));
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = this.$i18n.locale;
    const defaultLocale = this.$i18n.defaultLocale;
    const newsEntryResponse = await this.$directus.items('news').readOne(id, {
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
    if (newsEntryResponse) {
      let singleLanguageNewsEntry: (Omit<NewsEntry, 'categories'> & { categories: DirectusNewsCategory[] }) | undefined;
      if (newsEntryResponse.translations?.length) {
        try {
          singleLanguageNewsEntry = flattenForLanguage(newsEntryResponse, currentLocale);
        } catch (error) {
          console.warn(
            `News entry ${newsEntryResponse.id} is not available in ${currentLocale}. Falling back to default.`
          );
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
        this.newsEntry = {
          ...singleLanguageNewsEntry,
          categories: singleLanguageNewsEntry.categories.map((category) => ({
            id: category.id,
            ...category.news_categories_id.translations[0],
          })),
        };
      }
    }
  },
});
</script>

<style scoped>
.c-news-entry__loader {
  margin-top: auto;
}
</style>
