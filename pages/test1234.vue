<template>
  <section class="l-main-content-section">
    <img v-if="competition" :src="logoSrc" :srcset="logoSrcSet" class="competition-logo" />
    <h2 class="t-headline-1">Test 1234</h2>
    <st-navigation :items="navigation" class="navigation" :name="$t('otherNavigation', { name: 'Test 1234' })" small />
    <nuxt-child v-if="competition" :competition="competition" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';
import { getAssetURL } from '~/plugins/directus';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  data() {
    return {
      competition: undefined as NationalTeamCompetition | undefined,
      navigation: [
        { name: this.$t('internationalCompetition.navigation.live'), href: this.localePath('test1234-live') },
      ] as MenuItem[],
    };
  },
  async fetch() {
    this.competition = await this.$cmsService.getNationalTeamCompetition(26);
  },
  head(): MetaInfo {
    const title = 'Test 1234';
    const description = 'Test page for the international competitions';

    const metaInfo: MetaInfo = {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    };

    return metaInfo;
  },
  computed: {
    logoSrc(): string {
      if (!this.competition?.logo) {
        return '';
      }
      return getAssetURL(this.$config.cmsURL, this.competition.logo, { width: 180 });
    },
    logoSrcSet(): string {
      if (!this.competition?.logo) {
        return '';
      }
      return `${getAssetURL(this.$config.cmsURL, this.competition.logo, {
        width: 360,
      })} 2x`;
    },
  },
});
</script>

<style scoped>
.competition-logo {
  margin: auto;
  display: block;
}

.navigation {
  margin-top: var(--st-length-spacing-s);
  margin-bottom: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .competition-logo {
    float: right;
  }
}
</style>
