<template>
  <section class="l-main-content-section">
    <img v-if="competition" :src="logoSrc" :srcset="logoSrcSet" class="competition-logo" />
    <h2 class="t-headline-1">{{ $t('internationalCompetition.wtc2023.title') }}</h2>
    <st-navigation
      :items="navigation"
      class="navigation"
      :name="$t('otherNavigation', { name: $t('internationalCompetition.wtc2023.title') })"
      selected-on-exact-active
      small
    />
    <nuxt-child />
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
        { name: this.$t('internationalCompetition.navigation.live'), href: this.localePath('wtc2023-live') },
        { name: this.$t('internationalCompetition.navigation.about'), href: this.localePath('wtc2023-about') },
        { name: this.$t('internationalCompetition.navigation.schedule'), href: this.localePath('wtc2023-schedule') },
        { name: this.$t('internationalCompetition.navigation.medias'), href: this.localePath('wtc2023-medias') },
        { name: this.$t('internationalCompetition.navigation.teams'), href: this.localePath('wtc2023-teams') },
      ] as MenuItem[],
    };
  },
  async fetch() {
    this.competition = await this.$cmsService.getNationalTeamCompetition(24);
  },
  head(): MetaInfo {
    const title = this.$t('internationalCompetition.wtc2023.title').toString();
    const description = this.$t('internationalCompetition.wtc2023.shortDescription').toString();

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
