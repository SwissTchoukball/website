<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-press-releases__title">{{ $t('pressReleases.name', 2) }}</h2>

    <StLoader v-if="fetchPending" main />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <ul class="u-unstyled-list c-press-releases__list">
      <li v-for="pressRelease in data.pressReleaseList" :key="pressRelease.id" class="c-press-releases__list-item">
        <nuxt-link
          :to="
            localePath({
              name: 'press-releases-slug',
              params: { slug: `${pressRelease.id}-${pressRelease.slug}` },
            })
          "
          class="c-press-releases__one-link"
        >
          <time :datetime="pressRelease.date_created" class="c-press-releases__one-date">
            {{ $formatDate(new Date(pressRelease.date_created), 'dd.MM.yyyy') }}
          </time>
          <div class="c-press-releases__one-context">{{ pressRelease.context }}</div>
          <div class="c-press-releases__one-title">{{ pressRelease.title }}</div>
        </nuxt-link>
      </li>
    </ul>

    <st-pagination v-if="totalPages && totalPages > 1" :current-page="currentPage" :total-pages="totalPages" />

    <p class="c-press-releases__subscribe">
      {{ $t('pressReleases.subscribe') }} :
      <nuxt-link :to="localePath({ name: 'newsletter', query: { name: 'medias-fr' } })">{{
        $t('languages.french')
      }}</nuxt-link>
      /
      <nuxt-link :to="localePath({ name: 'newsletter', query: { name: 'medias-de' } })">{{
        $t('languages.german')
      }}</nuxt-link>
    </p>

    <p class="c-press-releases__previous">
      <a href="https://files.tchoukball.ch/medias">{{ $t('pressReleases.previousPressReleases') }}</a>
    </p>
  </section>
</template>

<script setup lang="ts">
import type { PressRelease } from '~/components/press-releases/press-releases';

const localePath = useLocalePath();
const route = useRoute();
const { t } = useI18n();
const { $cmsService, $formatDate } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/communiques-de-presse',
    de: '/medienmitteilungen',
  },
});

useHead(() => {
  return {
    title: t('pressReleases.name', 2),
    meta: [{ property: 'og:title', content: t('pressReleases.name', 2) }],
  };
});

const pressReleasesPerPage = 25;

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
} = useAsyncData<{ pressReleaseList: PressRelease[]; totalPressReleases: number }>(
  'press-releases',
  async () => {
    const pressReleasesResult = await $cmsService.getPressReleaseList({
      limit: pressReleasesPerPage,
      page: currentPage.value,
    });

    return {
      pressReleaseList: pressReleasesResult.data,
      totalPressReleases: pressReleasesResult.meta.total,
    };
  },
  { default: () => ({ pressReleaseList: [], totalPressReleases: 0 }) },
);

const totalPages = computed<number | undefined>(() => {
  if (!data.value.totalPressReleases) {
    return;
  }
  return Math.ceil(data.value.totalPressReleases / pressReleasesPerPage);
});
</script>

<style scoped>
.c-press-releases__list {
  margin-top: var(--st-length-spacing-s);
}

.c-press-releases__list-item {
  margin-top: var(--st-length-spacing-s);
}

.c-press-releases__one-link {
  text-decoration: none;
  color: inherit;
}

.c-press-releases__one-date {
  font-size: 0.8rem;
  color: var(--st-color-press-release-date-foreground);
}

.c-press-releases__one-context {
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: bold;
}

.c-press-releases__one-title {
  font-weight: 900;
  font-size: 1.5rem;
  color: var(--st-color-link);
}

.c-press-releases__subscribe {
  margin-top: var(--st-length-spacing-m);
}

.c-press-releases__previous {
  margin-top: var(--st-length-spacing-s);
}
</style>
