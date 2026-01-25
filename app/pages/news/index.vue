<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('news.title') }}</h2>
    <st-newsletter-link class="c-news__newsletter-link" />
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else>
      <p v-if="filteredDomainName" class="c-news__domain-filter-info">
        <i18n-t keypath="news.domainFilterInfo" scope="global">
          <template #domainName>
            <strong>{{ filteredDomainName }}</strong>
          </template>
        </i18n-t>
        <span class="c-news__domain-filter-info-separator">—</span>
        <nuxt-link :to="localePath('news')">{{ $t('news.showAll') }}</nuxt-link>
      </p>
      <st-news-list v-if="data" class="c-news__list" :news="data.newsList" />
    </template>
    <st-pagination v-if="totalPages" :current-page="currentPage" :total-pages="totalPages" />
  </section>
</template>

<script setup lang="ts">
import type { NewsEntry } from '~/components/news/st-news';

const route = useRoute();
const { t, locale } = useI18n();
const { $cmsService } = useNuxtApp();
const localePath = useLocalePath();
const domainsStore = useDomainsStore();

const newsEntriesPerPage = 12;

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
  if (!data.value?.totalNewsEntries) {
    return;
  }
  return Math.ceil(data.value.totalNewsEntries / newsEntriesPerPage);
});

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
});

const filteredDomainName = computed<string | undefined>(() => {
  if (!data.value?.filteredDomainId) {
    return;
  }
  const domain = domainsStore.getDomainById(data.value.filteredDomainId);

  return domain?.name;
});

const {
  data,
  pending: fetchPending,
  error: fetchError,
  refresh,
} = useAsyncData<{ newsList: NewsEntry[]; totalNewsEntries: number; filteredDomainId: number | undefined }>(
  `news-list-${route.query.domain}-${newsEntriesPerPage}-${currentPage.value}-${locale.value}`,
  async () => {
    let queryDomainId: number | undefined;
    if (typeof route.query.domain === 'string') {
      queryDomainId = parseInt(route.query.domain);
    }
    const newsResult = await $cmsService.getNews({
      limit: newsEntriesPerPage,
      page: currentPage.value,
      domainId: queryDomainId,
    });

    return {
      newsList: newsResult.data,
      totalNewsEntries: newsResult.meta.total,
      filteredDomainId: newsResult.meta.filteredDomainId,
    };
  },
);

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    if (newQuery !== oldQuery) {
      await refresh();
    }
  },
);
</script>

<style>
.c-news__domain-filter-info {
  margin-top: var(--st-length-spacing-xs);
}

.c-news__domain-filter-info-separator {
  padding: 0 var(--st-length-spacing-xxs);
}

.c-news__newsletter-link {
  margin-top: var(--st-length-spacing-xs);
}

.c-news__list {
  margin-top: var(--st-length-spacing-s);
}
</style>
