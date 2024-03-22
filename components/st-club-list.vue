<template>
  <ul class="u-unstyled-list c-club-list">
    <li v-for="club of clubs" :key="club.id" class="c-club-list__club">
      <h3 class="t-headline-2">{{ club.name }}</h3>
      <img
        v-if="club.logo"
        :src="logoSrc(club.logo)"
        :srcset="logoSrcSet(club.logo)"
        :alt="$t('clubs.logoOf', { name: club.name }).toString()"
        class="c-club-list__club-logo"
      />
      <a v-if="club.website" :href="club.website" class="c-club-list__club-website">
        {{ getWebsiteDisplay(club.website) }}
      </a>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DirectusClub, getAssetURL } from '~/plugins/directus';

export default defineComponent({
  props: {
    clubs: {
      type: Array as PropType<DirectusClub[]>,
      required: true,
    },
  },
  methods: {
    logoSrc(assetId: string): string {
      return getAssetURL(this.$config.cmsURL, assetId, { width: 200 });
    },
    logoSrcSet(assetId: string): string {
      return `${getAssetURL(this.$config.cmsURL, assetId, { width: 400 })} 2x`;
    },
    getWebsiteDisplay(website: string): string | null {
      if (!website) {
        return null;
      }
      const result = website.match(/http(?:s?):\/\/(?:www\.)?(.*)/);
      if (result && result.length >= 2) {
        return result[1];
      }
      return website;
    },
  },
});
</script>

<style scoped>
.c-club-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2%;
}

.c-club-list__club {
  width: 100%;
  margin-top: var(--st-length-spacing-m);
  text-align: center;
}

.c-club-list__club-logo {
  margin-top: var(--st-length-spacing-xs);
}

.c-club-list__club-website {
  display: block;
  margin-top: var(--st-length-spacing-xs);
}

@media (--sm-and-up) {
  .c-club-list__club {
    width: 49%;
  }
}

@media (--md-and-up) {
  .c-club-list__club {
    width: 32%;
  }
}
</style>
