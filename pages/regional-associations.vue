<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('regionalAssociations.title') }}</h2>
    <p class="c-regional-associations__amount">
      {{ $t('regionalAssociations.amount', { amount: associations.length }) }}
    </p>
    <st-club-list :clubs="associations" />
  </section>
</template>

<script lang="ts">
import { ItemInput } from '@directus/sdk';
import { defineComponent } from 'vue';
import stClubList from '~/components/st-club-list.vue';
import { DirectusClub } from '~/plugins/directus';

export default defineComponent({
  components: { stClubList },
  data() {
    return {
      associations: [] as ItemInput<DirectusClub>[],
    };
  },
  nuxtI18n: {
    paths: {
      fr: '/associations-regionales',
      de: '/regionalverbaende',
    },
  },
  async fetch() {
    this.associations = await this.$cmsService.getClubs({ statuses: ['regional_association'] });
  },
  head() {
    return {
      title: this.$t('regionalAssociations.title').toString(),
      meta: [
        { property: 'og:title', content: this.$t('regionalAssociations.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('regionalAssociations.description').toString(),
        },
      ],
    };
  },
});
</script>

<style scoped>
.c-regional-associations__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
