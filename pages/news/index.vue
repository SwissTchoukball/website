<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('news.title') }}</h2>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
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

<script setup lang="ts">
import type { NewsEntry } from '~/components/news/st-news';

const route = useRoute();
const { t } = useI18n();
const { $cmsService } = useNuxtApp();
const domainsStore = useDomainsStore();

const newsList = ref<NewsEntry[]>([]);
const newsEntriesPerPage = ref(12);
const totalNewsEntries = ref<number>();
const filteredDomainId = ref<number>();

useHead(() => {
  return {
    title: t('news.title').toString(),
    meta: [
      { property: 'og:title', content: t('news.title').toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('news.description').toString(),
      },
    ],
  };
});

const totalPages = computed<number | undefined>(() => {
  if (!totalNewsEntries.value) {
    return;
  }
  return Math.ceil(totalNewsEntries.value / newsEntriesPerPage.value);
});

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
});

const filteredDomainName = computed<string | undefined>(() => {
  if (!filteredDomainId.value) {
    return;
  }
  const domain = domainsStore.getDomainById(filteredDomainId.value);

  return domain?.name;
});

const fetchNews = async () => {
  let queryDomainId: number | undefined;
  if (typeof route.query.domain === 'string') {
    queryDomainId = parseInt(route.query.domain);
  }
  const newsResult = await $cmsService.getNews({
    limit: newsEntriesPerPage.value,
    page: currentPage.value,
    domainId: queryDomainId,
  });

  newsList.value = newsResult.data;
  totalNewsEntries.value = newsResult.meta.total;
  filteredDomainId.value = newsResult.meta.filteredDomainId;
};

watch(route.query, fetchNews);
const { pending: fetchPending, error: fetchError } = useAsyncData('news', fetchNews);
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
