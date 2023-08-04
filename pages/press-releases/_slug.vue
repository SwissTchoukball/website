<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <article v-else class="c-press-release">
      <st-breadcrumb :items="breadcrumb" />
      <div v-if="isDraft" class="c-press-release__draft-label">{{ $t('pressReleases.draft') }}</div>
      <div v-if="pressRelease.context" class="c-press-release__context">{{ pressRelease.context }}</div>
      <h2 class="c-press-release__title t-headline-1">{{ pressRelease.title }}</h2>
      <p class="c-press-release__dates">{{ dates }}</p>
      <!-- We have to use v-html here as we get html content directly from Directus -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="directus-formatted-content c-press-release__body" v-html="pressRelease.body"></div>
    </article>
  </section>
</template>

<script lang="ts">
import { decode } from 'html-entities';
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import { PressRelease } from '~/components/press-releases/press-releases';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/communiques-de-presse/:slug',
      de: '/medienmitteilungen/:slug',
    },
  },
  data() {
    return {
      pressRelease: undefined as PressRelease | undefined,
      breadcrumb: [
        {
          pageName: 'press-releases',
          displayName: this.$tc('pressReleases.name', 2),
        },
      ] as BreadcrumbItem[],
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    let id: number;
    if (slug.includes('-')) {
      id = parseInt(slug.substr(0, slug.indexOf('-')));
    } else {
      id = parseInt(slug);
    }

    if (!id) {
      throw new Error('Invalid press release ID');
    }

    this.pressRelease = await this.$cmsService.getPressRelease(id);
  },
  head(): MetaInfo {
    const title = this.pressRelease?.title || 'Press release';
    const description = this.pressRelease?.body
      ? decode(this.pressRelease.body.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
      : '';

    const metaInfo: MetaInfo = {
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

    return metaInfo;
  },
  computed: {
    creationDate(): string {
      if (this.pressRelease?.date_created) {
        return this.$formatDate(new Date(this.pressRelease.date_created), 'PPP');
      }
      return '';
    },
    updateDate(): string | undefined {
      if (this.pressRelease?.date_updated) {
        return this.$formatDate(new Date(this.pressRelease.date_updated), 'PPP');
      }
      return undefined;
    },
    dates(): string {
      let dates = `${this.$t('news.publishedOn')} ${this.creationDate}`;

      if (this.updateDate && this.creationDate !== this.updateDate) {
        dates += `, ${this.$t('news.updatedOn')} ${this.updateDate}`;
      }

      return dates;
    },
    isDraft(): boolean {
      return this.pressRelease?.status === 'draft';
    },
  },
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
</style>
