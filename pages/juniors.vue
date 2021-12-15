<template>
  <div>
    <st-dynamic-page :title="title" :body="body" />

    <section class="l-main-content-section">
      <h4 class="t-headline-3">{{ $t('categoryDistribution.title', { season: seasonName }) }}</h4>
      <st-category-distribution-table :season-start-year="currentSeasonStartYear" />
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CatchAllPage from '~/pages/_.vue';

export default Vue.extend({
  extends: CatchAllPage,
  nuxtI18n: {
    paths: {
      fr: '/juniors',
      de: '/junioren',
    },
  },
  computed: {
    currentSeasonStartYear(): number {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // We show the table for the next season starting from July
      if (currentMonth > 6) {
        return currentYear;
      } else {
        return currentYear - 1;
      }
    },
    seasonName(): string {
      return `${this.currentSeasonStartYear} - ${this.currentSeasonStartYear + 1}`;
    },
  },
});
</script>
