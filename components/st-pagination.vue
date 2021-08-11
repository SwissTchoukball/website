<template>
  <nav class="c-pagination">
    <h2 class="u-visually-hidden">{{ $t('pagination.title') }}</h2>

    <ul class="u-unstyled-list c-pagination__pages">
      <li class="c-pagination__page" :class="{ 'c-pagination__page--hidden': isFirstPage }">
        <nuxt-link :to="pageLink(1)" :title="$t('pagination.firstPage')">
          <fa-icon icon="angle-double-left" />
        </nuxt-link>
      </li>

      <li class="c-pagination__page" :class="{ 'c-pagination__page--hidden': isFirstPage }">
        <nuxt-link :to="pageLink(currentPage - 1)" :title="$t('pagination.previousPage')">
          <fa-icon icon="angle-left" />
        </nuxt-link>
      </li>
      <li
        v-for="page of pagesRange"
        :key="`page-${page}`"
        class="c-pagination__page"
        :class="{ 'c-pagination__page--current': page === currentPage }"
      >
        <nuxt-link :to="pageLink(page)">{{ page }}</nuxt-link>
      </li>
      <li class="c-pagination__page" :class="{ 'c-pagination__page--hidden': isLastPage }">
        <nuxt-link :to="pageLink(currentPage + 1)" :title="$t('pagination.nextPage')">
          <fa-icon icon="angle-right" />
        </nuxt-link>
      </li>

      <li class="c-pagination__page" :class="{ 'c-pagination__page--hidden': isLastPage }">
        <nuxt-link :to="pageLink(totalPages)" :title="$t('pagination.lastPage')">
          <fa-icon icon="angle-double-right" />
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      maxPagesShown: 5,
    };
  },
  computed: {
    isFirstPage() {
      return this.currentPage === 1;
    },
    isLastPage() {
      return this.currentPage === this.totalPages;
    },
    pagesShown(): number {
      return this.totalPages < 5 ? this.totalPages : this.maxPagesShown;
    },
    /**
     * The ideal amount of pages we want to be listed before and after the current page
     */
    pageListMargin(): number {
      return Math.floor(this.pagesShown / 2);
    },
    firstListedPage(): number {
      if (this.currentPage > this.totalPages - this.pageListMargin) {
        return this.totalPages - this.pagesShown + 1;
      }

      return Math.max(1, this.currentPage - this.pageListMargin);
    },
    pagesRange(): number[] {
      return Array.from({ length: this.pagesShown }, (_, i) => i + this.firstListedPage);
    },
  },
  methods: {
    pageLink(pageNumber: number) {
      if (pageNumber < 1) {
        return '';
      }
      return this.localePath({ path: this.$route.path, query: { page: pageNumber.toString() } });
    },
  },
});
</script>

<style scoped>
.c-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-pagination__current-page {
  margin: 0 20px;
}

.c-pagination__pages {
  display: flex;
}

.c-pagination__page a {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  margin: 0 0.1rem;
  border-radius: 5px;
  text-align: center;
  padding-top: 0.4rem;
  text-decoration: none;
  color: var(--st-color-text);
}

.c-pagination__page--current a {
  color: var(--st-color-link);
  pointer-events: none;
}

.c-pagination__page--current a,
.c-pagination__page a:active,
.c-pagination__page a:hover {
  background-color: var(--st-color-pagination-page-active-background);
}

.c-pagination__page--hidden {
  visibility: hidden;
}

.c-pagination__button {
  width: 60px;
  margin: 0 2px;
  min-width: auto;
  padding: 0;
}

.c-pagination__button:first-of-type {
  margin-left: 0;
}

.c-pagination__button:last-of-type {
  margin-right: 0;
}
</style>
