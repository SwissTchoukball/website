<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('clubs.title') }}</h2>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <p class="c-clubs__amount">{{ $t('clubs.amountMembers', { amount: clubs.length }) }}</p>
      <st-club-list :clubs="clubs" />
    </template>
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
      clubs: [] as ItemInput<DirectusClub>[],
    };
  },
  nuxtI18n: {
    paths: {
      fr: '/clubs',
      de: '/vereine',
    },
  },
  async fetch() {
    this.clubs = await this.$cmsService.getClubs({ statuses: ['active', 'passive'] });
  },
  head() {
    return {
      title: this.$t('clubs.title').toString(),
      meta: [
        { property: 'og:title', content: this.$t('clubs.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('clubs.description').toString(),
        },
      ],
    };
  },
});
</script>

<style scoped>
.c-clubs__amount {
  margin-top: var(--st-length-spacing-xs);
}
</style>
