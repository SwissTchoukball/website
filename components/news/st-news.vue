<template>
  <article class="c-news-entry">
    <st-breadcrumb :items="breadcrumb" />
    <st-domain-labels :domains="domains" target-page-name="news" class="c-news-entry__domain-labels" />
    <h2 class="c-news-entry__title t-headline-1">{{ newsEntry.title }}</h2>
    <img
      v-if="newsEntry.main_image"
      class="c-news-entry__image"
      :alt="newsEntry.main_image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="imgTagSizes"
    />
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content c-news-entry__body" v-html="newsEntry.body"></div>
    <p class="c-news-entry__dates">{{ dates }}</p>
  </article>
</template>

<script setup lang="ts">
import type { NewsEntry } from '~/components/news/st-news';
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { Domain } from '~/plugins/08.cms-service';
import { getAssetURL, getAssetSrcSet } from '~/plugins/06.directus';
import { useDomains } from '~/composables/useDomains';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const { $formatDate } = useNuxtApp();
const { t } = useI18n();
const { getDomainsFromList } = useDomains();

const props = defineProps({
  newsEntry: {
    type: Object as PropType<NewsEntry>,
    required: true,
  },
});

const imgTagSizes = ref('');

const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'news',
    displayName: 'News',
  },
]);

const mainImageFallbackSrc = computed<string>(() => {
  if (!props.newsEntry.main_image) {
    return '';
  }
  return getAssetURL(runtimeConfig.public.cmsURL, props.newsEntry.main_image.id, {
    width: appConfig.keyVisualSizes[0],
  });
});

const mainImageSrcSet = computed<string>(() => {
  if (!props.newsEntry.main_image) {
    return '';
  }
  return getAssetSrcSet(runtimeConfig.public.cmsURL, props.newsEntry.main_image.id, {
    widths: appConfig.keyVisualSizes,
  });
});

const creationDate = computed<string>(() => {
  return $formatDate(new Date(props.newsEntry.date_created), 'PPP');
});

const updateDate = computed<string | undefined>(() => {
  if (props.newsEntry.date_updated) {
    return $formatDate(new Date(props.newsEntry.date_updated), 'PPP');
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

const domains = computed<Domain[]>(() => {
  return getDomainsFromList(props.newsEntry.domain_ids);
});

onMounted(() => {
  const bodyStyles = window.getComputedStyle(document.body);
  const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoint-l-xl');
  imgTagSizes.value = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-news-entry {
  margin-top: var(--st-length-spacing-xs);
}

.c-news-entry__domain-labels {
  margin-top: var(--st-length-spacing-s);
}

.c-news-entry__title {
  padding-top: var(--st-length-spacing-xs);
}

.c-news-entry__image {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
  margin-top: var(--st-length-spacing-s);
  height: auto;
  object-fit: cover;
}

.c-news-entry__body {
  margin-top: var(--st-length-spacing-s);
}

.c-news-entry__dates {
  margin-top: var(--st-length-spacing-s);
  color: var(--st-color-news-date-foreground);
}

.c-news-entry__dates::first-letter {
  text-transform: uppercase;
}

@media (--md-and-up) {
  .c-news-entry {
    margin-top: var(--st-length-spacing-s);
  }
}

@media (--xl-and-up) {
  .c-news-entry__image {
    width: var(--st-breakpoint-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoint-l-xl) - var(--st-length-main-content-max-width)) / 2);
  }
}

@media (orientation: landscape) {
  .c-news-entry__image {
    aspect-ratio: 2 / 1;
  }

  @supports not (aspect-ratio: 2 / 1) {
    .c-news-entry__image::before {
      float: left;
      padding-top: 40%;
      content: '';
    }

    .c-news-entry__image::after {
      display: block;
      content: '';
      clear: both;
    }
  }
}
</style>
