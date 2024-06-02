<template>
  <section class="l-main-content-section c-event-page">
    <st-breadcrumb :items="breadcrumb" />
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-event v-else-if="event" :event="event" :show-year="true" class="c-event-page__event" />
  </section>
</template>

<script lang="ts">
import { decode } from 'html-entities';
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import stEvent from '~/components/events/st-event.vue';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import { CalendarEvent } from '~/plugins/08.cms-service';
import { getAssetURL } from '~/plugins/06.directus';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/evenement/:slug',
      de: '/ereignis/:slug',
    },
  },
  components: { stEvent },
  data() {
    return {
      event: undefined as CalendarEvent | undefined,
      breadcrumb: [
        {
          pageName: 'calendar',
          displayName: this.$t('events.title'),
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
      throw new Error('Invalid event ID');
    }

    this.event = await this.$cmsService.getEvent(id);

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
    }
  },
  head(): MetaInfo {
    const title = this.event?.name || '';
    const description = this.event?.description
      ? decode(this.event.description.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…'
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

    if (this.event?.image) {
      metaInfo.meta?.push(
        {
          hid: 'og:image',
          property: 'og:image',
          content: getAssetURL(this.$config.cmsURL, this.event.image.id, this.$config.ogImageParams),
        },
        {
          hid: 'og:image:alt',
          property: 'og:image:alt',
          content: this.event.image.description || '',
        },
      );
    }

    return metaInfo;
  },
});
</script>

<style scoped>
.c-event-page {
  margin-top: var(--st-length-spacing-xs);
}

.c-event-page__event {
  margin-top: var(--st-length-spacing-s);
}
</style>
