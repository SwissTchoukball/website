<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-press-releases__title">{{ $tc('pressReleases.name', 2) }}</h2>

    <st-link-list
      :items="pressReleaseNavigation"
      :name="$t('otherNavigation', { name: $tc('pressReleases.name', 2) })"
      class="c-press-releases__list"
    />

    <st-pagination v-if="totalPages && totalPages > 1" :current-page="currentPage" :total-pages="totalPages" />

    <p class="c-press-releases__previous">
      <a href="https://files.tchoukball.ch/medias">{{ $t('pressReleases.previousPressReleases') }}</a>
    </p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MenuItem } from '~/store/state';
import { PressRelease } from '~/components/press-releases/press-releases';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/communiques-de-presse',
      de: '/medienmitteilungen',
    },
  },
  data() {
    return {
      pressReleaseList: [] as PressRelease[],
      pressReleasesPerPage: 25,
      totalPressReleases: undefined as number | undefined,
    };
  },
  async fetch() {
    const pressReleasesResult = await this.$cmsService.getPressReleaseList({
      limit: this.pressReleasesPerPage,
      page: this.currentPage,
    });

    this.pressReleaseList = pressReleasesResult.data;
    this.totalPressReleases = pressReleasesResult.meta.total;
  },
  computed: {
    totalPages(): number | undefined {
      if (!this.totalPressReleases) {
        return;
      }
      return Math.ceil(this.totalPressReleases / this.pressReleasesPerPage);
    },
    currentPage(): number {
      if (this.$route.query.page && typeof this.$route.query.page === 'string') {
        return parseInt(this.$route.query.page);
      }

      return 1;
    },
    pressReleaseNavigation(): MenuItem[] {
      return this.pressReleaseList.map((pressRelease) => {
        return {
          name: `${this.$formatDate(new Date(pressRelease.date_created), 'dd.MM.yyyy')} – ${pressRelease.title}`,
          href: this.localePath({
            name: 'press-releases-slug',
            params: { slug: `${pressRelease.id}-${pressRelease.slug}` },
          }),
        };
      });
    },
  },
});
</script>

<style scoped>
.c-press-releases__list {
  margin-top: var(--st-length-spacing-s);
}

.c-press-releases__previous {
  margin-top: var(--st-length-spacing-s);
}
</style>
