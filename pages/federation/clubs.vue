<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('clubs.title') }}</h2>
    <p class="c-clubs__amount">{{ $t('clubs.amountMembers', { amount: clubs.length }) }}</p>
    <st-club-list :clubs="clubs" />
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
      fr: '/federation/clubs',
      de: '/verband/vereine',
    },
  },
  async fetch() {
    // We load the clubs only if we don't have them already
    if (!this.Club.exists()) {
      await this.$store.dispatch('loadClubs');
    }
  },
  head() {
    return {
      title: this.$t('clubs.title').toString(),
    };
  },
  computed: {
    Club() {
      return this.$store.$db().model(Club);
    },
    clubs(): Collection<Club> {
      // Regional associations are also saved as clubs, but we don't want to show them on this page.
      return this.Club.query().where('status', 'active').orWhere('status', 'passive').orderBy('name_sort').get();
    },
  },
});
</script>

<style scoped>
.c-clubs__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
