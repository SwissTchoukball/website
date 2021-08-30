<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('clubs.title') }}</h2>
    <p class="c-clubs__amount">{{ $t('clubs.amountMembers', { amount: clubs.length }) }}</p>
    <ul class="u-unstyled-list c-clubs__list">
      <li v-for="club of clubs" :key="club.id" class="c-clubs__club">
        <h3 class="t-headline-2">{{ club.name }}</h3>
        <img
          v-if="club.logo"
          :src="logoSrc(club.logo)"
          :srcset="logoSrcSet(club.logo)"
          :alt="$t('clubs.logoOf', { name: club.name })"
          class="c-clubs__club-logo"
        />
        <a :href="club.website" class="c-clubs__club-website">{{ club.websiteDisplay }}</a>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { Collection } from '@vuex-orm/core';
import Vue from 'vue';
import Club from '~/models/club.model';
import { getAssetURL } from '~/plugins/directus';

export default Vue.extend({
  async fetch() {
    // We load the clubs only if we don't have them already
    if (!this.Club.exists()) {
      await this.$store.dispatch('loadClubs');
    }
  },
  computed: {
    Club() {
      return this.$store.$db().model(Club);
    },
    clubs(): Collection<Club> {
      return this.Club.query().orderBy('name_sort').get();
    },
  },
  methods: {
    logoSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, { width: 200 });
    },
    logoSrcSet(assetId: string): string {
      return `${getAssetURL(this.$config.cmsURL, assetId, { width: 400 })} 2x`;
    },
  },
});
</script>

<style scoped>
.c-clubs__amount {
  margin-top: var(--st-length-spacing-xs);
}

.c-clubs__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.c-clubs__club {
  width: 100%;
  margin-top: var(--st-length-spacing-m);
  text-align: center;
}

.c-clubs__club-logo {
  margin-top: var(--st-length-spacing-xs);
}

.c-clubs__club-website {
  display: block;
  margin-top: var(--st-length-spacing-xs);
}

@media (--sm-and-up) {
  .c-clubs__club {
    width: 50%;
  }
}

@media (--md-and-up) {
  .c-clubs__club {
    width: 33%;
  }
}
</style>
