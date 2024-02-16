<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources">
    <template #after-body>
      <st-loader v-if="$fetchState.pending" :main="true" />
      <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
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

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import CatchAllPage from '~/pages/_.vue';
import stTchoukupList from '~/components/tchoukup/st-tchoukup-list.vue';
import { Tchoukup } from '~/components/tchoukup/st-tchoukup';

export default defineComponent({
  components: {
    stTchoukupList,
  },
  extends: CatchAllPage,
  data() {
    return {
      tchoukupIssues: [] as Tchoukup[],
      issuesPerPage: 12,
      totalIssues: undefined as number | undefined,
    };
  },
  async fetch() {
    const tchoukupResult = await this.$cmsService.getTchoukups({
      limit: this.issuesPerPage,
      page: this.currentPage,
    });

    this.tchoukupIssues = tchoukupResult.data;
    this.totalIssues = tchoukupResult.meta.total;
  },
  head(): MetaInfo {
    return {
      title: this.$t('tchoukup.title').toString(),
      meta: [
        { property: 'og:title', content: this.$t('tchoukup.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('tchoukup.description').toString(),
        },
      ],
    };
  },
  computed: {
    totalPages(): number | undefined {
      if (!this.totalIssues) {
        return;
      }
      return Math.ceil(this.totalIssues / this.issuesPerPage);
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

<style scoped>
.c-tchoukup__list {
  margin-top: var(--st-length-spacing-m);
}

.c-tchoukup__pagination {
  margin-top: var(--st-length-spacing-m);
}
</style>
