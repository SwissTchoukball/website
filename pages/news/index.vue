<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('news.title') }}</h2>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <p v-if="filteredDomainName" class="c-news__domain-filter-info">
        <i18n path="news.domainFilterInfo">
          <template #domainName>
            <strong>{{ filteredDomainName }}</strong>
          </template>
        </i18n>
        <span class="c-news__domain-filter-info-separator">—</span>
        <nuxt-link :to="''">{{ $t('news.showAll') }}</nuxt-link>
      </p>
      <st-news-list class="c-news__list" :news="newsList" />
    </template>
    <st-pagination v-if="totalPages" :current-page="currentPage" :total-pages="totalPages" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import stLoader from '~/components/st-loader.vue';
import stNewsList from '~/components/news/st-news-list.vue';
import { NewsEntry } from '~/components/news/st-news';
import StPagination from '~/components/st-pagination.vue';
import { DirectusDomain } from '~/plugins/directus';

export default defineComponent({
  components: { stLoader, stNewsList, StPagination },
  data() {
    return {
      newsList: [] as NewsEntry[],
      newsEntriesPerPage: 12,
      totalNewsEntries: undefined as number | undefined,
      filteredDomainId: undefined as number | undefined,
    };
  },
  async fetch() {
    let filteredDomainId: number | undefined;
    if (typeof this.$route.query.domain === 'string') {
      filteredDomainId = parseInt(this.$route.query.domain);
    }
    const newsResult = await this.$cmsService.getNews({
      limit: this.newsEntriesPerPage,
      page: this.currentPage,
      domainId: filteredDomainId,
    });

    this.newsList = newsResult.data;
    this.totalNewsEntries = newsResult.meta.total;
    this.filteredDomainId = newsResult.meta.filteredDomainId;
  },
  head(): MetaInfo {
    return {
      title: this.$t('news.title').toString(),
      meta: [
        { property: 'og:title', content: this.$t('news.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('news.description').toString(),
        },
      ],
    };
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
    filteredDomainName(): string | undefined {
      if (!this.filteredDomainId) {
        return;
      }
      const domain: DirectusDomain = this.$store.getters.getDomainById(this.filteredDomainId);

      return domain.name;
    },
  },
  watch: {
    '$route.query': '$fetch',
  },
});
</script>

<style>
.c-news__domain-filter-info {
  margin-top: var(--st-length-spacing-xs);
}

.c-news__domain-filter-info-separator {
  padding: 0 var(--st-length-spacing-xxs);
}

.c-news__list {
  margin-top: var(--st-length-spacing-m);
}
</style>
