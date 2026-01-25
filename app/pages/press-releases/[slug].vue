<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <article v-else-if="pressRelease" class="c-press-release">
      <st-breadcrumb :items="breadcrumb" />
      <div v-if="isDraft" class="c-press-release__draft-label">{{ $t('pressReleases.draft') }}</div>
      <div v-if="pressRelease.context" class="c-press-release__context">{{ pressRelease.context }}</div>
      <h2 class="c-press-release__title t-headline-1">{{ pressRelease.title }}</h2>
      <p class="c-press-release__dates">{{ dates }}</p>
      <!-- We have to use v-html here as we get html content directly from Directus -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="directus-formatted-content c-press-release__body" v-html="pressRelease.body"></div>
    </article>
    <st-role v-if="headOfCommunicationRole" :role="headOfCommunicationRole" class="c-press-release__contact" />
  </section>
</template>

<script setup lang="ts">
import { decode } from 'html-entities';
import type { PressRelease } from '~/components/press-releases/press-releases';
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { RoleWithPartialGroupAndHolders } from '~/plugins/08.cms-service';

const MEDIA_COORDINATOR_ROLE = 62;

const { t, locale } = useI18n();
const route = useRoute();
const { $cmsService, $formatDate } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/communiques-de-presse/[slug]',
    de: '/medienmitteilungen/[slug]',
  },
});

const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'press-releases',
    displayName: t('pressReleases.name', 2),
  },
]);

const {
  data: pressRelease,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<PressRelease>(`press-release-${route.params.slug as string}-${locale.value}`, async () => {
  const slug = route.params.slug as string;
  let id: number;
  if (slug.includes('-')) {
    id = parseInt(slug.substring(0, slug.indexOf('-')));
  } else {
    id = parseInt(slug);
  }

  if (!id) {
    throw new Error('Invalid press release ID');
  }

  return await $cmsService.getPressRelease(id);
});

const { data: headOfCommunicationRole } = useAsyncData<RoleWithPartialGroupAndHolders>(
  `head-of-communication-role-${locale.value}`,
  async () => {
    return await $cmsService.getRole(MEDIA_COORDINATOR_ROLE);
  },
);

useHead(() => {
  const title = pressRelease.value?.title || 'Press release';
  const description = pressRelease.value?.body
    ? decode(pressRelease.value.body.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
    : '';

  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: description,
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: `article`,
      },
    ],
  };
});

const creationDate = computed<string>(() => {
  if (pressRelease.value?.date_created) {
    return $formatDate(new Date(pressRelease.value.date_created), 'PPP');
  }
  return '';
});

const updateDate = computed<string | undefined>(() => {
  if (pressRelease.value?.date_updated) {
    return $formatDate(new Date(pressRelease.value.date_updated), 'PPP');
  }
  return undefined;
});

const dates = computed<string>(() => {
  let dates = `${t('news.publishedOn')} ${creationDate.value}`;

  if (updateDate.value && creationDate.value !== updateDate.value) {
    dates += `, ${t('news.updatedOn')} ${updateDate.value}`;
  }

  return dates;
});

const isDraft = computed<boolean>(() => {
  return pressRelease.value?.status === 'draft';
});
</script>

<style scoped>
.c-press-release {
  margin-top: var(--st-length-spacing-s);
}

.c-press-release__draft-label {
  background-color: yellow;
  padding: var(--st-length-spacing-xxs);
  margin: var(--st-length-spacing-s) 0;
  font-weight: bold;
  font-size: 1.3em;
  text-align: center;
  text-transform: uppercase;
}

.c-press-release__context {
  margin-top: var(--st-length-spacing-s);
  color: var(--st-color-press-release-context-foreground);
  background-color: var(--st-color-press-release-context-background);
  display: inline-block;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 900;
  font-size: 0.8em;
  padding: 0.2em 0.3em;
}

.c-press-release__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-press-release__body {
  margin-top: var(--st-length-spacing-s);
}

.c-press-release__dates {
  margin-top: var(--st-length-spacing-xxs);
  color: var(--st-color-press-release-date-foreground);
}

.c-press-release__dates::first-letter {
  text-transform: uppercase;
}

.c-press-release__contact {
  margin-top: var(--st-length-spacing-m);
}
</style>
