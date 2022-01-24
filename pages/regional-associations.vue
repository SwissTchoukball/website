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
import { Collection } from '@vuex-orm/core';
import Vue from 'vue';
import stClubList from '~/components/st-club-list.vue';
import Club from '~/models/club.model';

export default Vue.extend({
  components: { stClubList },
  nuxtI18n: {
    paths: {
      fr: '/associations-regionales',
      de: '/regionalverbaende',
    },
  },
  async fetch() {
    // We load the clubs (which include regional associations) only if we don't have them already
    if (!this.Club.exists()) {
      await this.$store.dispatch('loadClubs');
    }
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
  computed: {
    Club() {
      return this.$store.$db().model(Club);
    },
    associations(): Collection<Club> {
      // Regional associations are also saved as clubs
      return this.Club.query().where('status', 'regional_association').orderBy('name_sort').get();
    },
  },
});
</script>

<style scoped>
.c-regional-associations__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
