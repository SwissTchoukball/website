<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources">
    <template #after-body>
      <st-loader v-if="fetchPending" :main="true" />
      <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
      <st-tchoukup-list v-else :issues="data.tchoukupIssues" class="c-tchoukup__list" />
      <st-pagination
        v-if="totalPages"
        :current-page="currentPage"
        :total-pages="totalPages"
        class="c-tchoukup__pagination"
      />
    </template>
  </st-simple-page>
</template>

<script setup lang="ts">
import type { Tchoukup } from '~/components/tchoukup/st-tchoukup';

const route = useRoute();
const { t } = useI18n();
const { $cmsService } = useNuxtApp();

const { fetchPage, title, body, keyRoles, resources } = useCatchAll();

const issuesPerPage = 12;

useHead(() => {
  return {
    title: t('tchoukup.title').toString(),
    meta: [
      { property: 'og:title', content: t('tchoukup.title').toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('tchoukup.description').toString(),
      },
    ],
  };
});

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
});

const {
  data,
  pending: fetchPending,
  error: fetchError,
  refresh,
} = useAsyncData<{ tchoukupIssues: Tchoukup[]; totalIssues: number }>(
  'tchoukups',
  async () => {
    const tchoukupResult = await $cmsService.getTchoukups({
      limit: issuesPerPage,
      page: currentPage.value,
    });

    return {
      tchoukupIssues: tchoukupResult.data,
      totalIssues: tchoukupResult.meta.total,
    };
  },
  { default: () => ({ tchoukupIssues: [], totalIssues: 0 }) },
);

const totalPages = computed<number | undefined>(() => {
  if (!data.value?.totalIssues) {
    return;
  }
  return Math.ceil(data.value.totalIssues / issuesPerPage);
});

watch(route, async (newRoute, oldRoute) => {
  if (newRoute.query !== oldRoute.query) {
    await refresh();
  }
});

try {
  await fetchPage();
} catch (err: any) {
  switch (err.message) {
    case 'pageNotFound':
      throw createError({ statusCode: 404, message: `Could not find page`, fatal: true });
    case 'noData':
      console.info('No data either in the requested locale or the fallback locale.');
      break;
    default:
      throw createError({ message: `Error when retrieving simple page: ${err}`, fatal: true });
  }
}
</script>

<style scoped>
.c-tchoukup__list {
  margin-top: var(--st-length-spacing-m);
}

.c-tchoukup__pagination {
  margin-top: var(--st-length-spacing-m);
}
</style>
