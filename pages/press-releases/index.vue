<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1 c-press-releases__title">{{ $t('pressReleases.name', 2) }}</h2>

    <ul class="u-unstyled-list c-press-releases__list">
      <li v-for="pressRelease in pressReleaseList" :key="pressRelease.id" class="c-press-releases__list-item">
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
const { $cmsService, $formatDate } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/communiques-de-presse',
    de: '/medienmitteilungen',
  },
});

const pressReleaseList = ref<PressRelease[]>([]);
const pressReleasesPerPage = ref(25);
const totalPressReleases = ref<number>();

useAsyncData('press-releases', async () => {
  const pressReleasesResult = await $cmsService.getPressReleaseList({
    limit: pressReleasesPerPage.value,
    page: currentPage.value,
  });

  pressReleaseList.value = pressReleasesResult.data;
  totalPressReleases.value = pressReleasesResult.meta.total;
});

const totalPages = computed<number | undefined>(() => {
  if (!totalPressReleases.value) {
    return;
  }
  return Math.ceil(totalPressReleases.value / pressReleasesPerPage.value);
});

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
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
