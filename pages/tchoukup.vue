<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources">
    <template #after-body>
      <st-loader v-if="fetchPending" :main="true" />
      <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
      <st-tchoukup-list v-else :issues="tchoukupIssues" class="c-tchoukup__list" />
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

const tchoukupIssues = ref<Tchoukup[]>([]);
const issuesPerPage = ref(12);
const totalIssues = ref<number | undefined>();

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

const fetchTchoukups = async () => {
  const tchoukupResult = await $cmsService.getTchoukups({
    limit: issuesPerPage.value,
    page: currentPage.value,
  });

  tchoukupIssues.value = tchoukupResult.data;
  totalIssues.value = tchoukupResult.meta.total;
};

const totalPages = computed<number | undefined>(() => {
  if (!totalIssues.value) {
    return;
  }
  return Math.ceil(totalIssues.value / issuesPerPage.value);
});

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
});

watch(route.query, fetchTchoukups);

fetchPage();

const { pending: fetchPending, error: fetchError } = useAsyncData('tchoukups', fetchTchoukups);
</script>

<style scoped>
.c-tchoukup__list {
  margin-top: var(--st-length-spacing-m);
}

.c-tchoukup__pagination {
  margin-top: var(--st-length-spacing-m);
}
</style>
