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
    let filteredCategoryId: number | undefined;
    if (typeof this.$route.query.category === 'string') {
      filteredCategoryId = parseInt(this.$route.query.category);
    }
    const newsResult = await this.$cmsService.getNews({
      limit: this.newsEntriesPerPage,
      page: this.currentPage,
      categoryId: filteredCategoryId,
    });

    this.newsList = newsResult.data;
    this.totalNewsEntries = newsResult.meta.total;
    this.filteredCategoryName = newsResult.meta.filteredCategoryName;
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
