<template>
  <section class="l-main-content-section c-resource-page">
    <st-breadcrumb :items="breadcrumb" />
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-resource v-else-if="resource" :resource="resource" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import stResource from '~/components/resources/st-resource.vue';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import { Resource } from '~/plugins/08.cms-service';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/ressources/:slug',
      de: '/ressourcen/:slug',
    },
  },
  components: { stResource },
  data() {
    return {
      resource: undefined as Resource | undefined,
      breadcrumb: [
        {
          pageName: 'resources',
          displayName: this.$t('resources.title'),
        },
      ] as BreadcrumbItem[],
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    let id: number;
    if (slug.includes('-')) {
      id = parseInt(slug.substring(0, slug.indexOf('-')));
    } else {
      id = parseInt(slug);
    }

    if (!id) {
      throw new Error('Invalid resource ID');
    }

    this.resource = await this.$cmsService.getResource(id);

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
    }
  },
  head(): MetaInfo {
    const title = this.resource?.name || '';

    const metaInfo: MetaInfo = {
      title,
      meta: [{ property: 'og:title', content: title }],
    };

    return metaInfo;
  },
});
</script>

<style scoped>
.c-resource-page {
  margin-top: var(--st-length-spacing-xs);
}
</style>
