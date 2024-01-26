<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else-if="!$fetchState.pending && competition">
      <img :src="logoSrc" :srcset="logoSrcSet" class="competition-logo" />

      <h2 class="t-headline-1">{{ fullName }}</h2>

      <st-navigation
        :items="navigation"
        class="navigation"
        :name="$t('otherNavigation', { name: fullName })"
        selected-on-exact-active
        small
      />

      <nuxt-child :competition="competition" :navigation="navigation" />
    </template>
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
      navigation: [] as MenuItem[],
    };
  },
  async fetch() {
    const competitionSlug = this.$route.params.competition;
    this.competition = await this.$cmsService.getNationalTeamCompetition({ slug: competitionSlug });

    // Building navigation
    const possibleTexts = ['live', 'about', 'schedule', 'medias'] as const;
    for (const possibleTextKey of possibleTexts) {
      if (this.competition[possibleTextKey]) {
        this.navigation.push({
          name: this.$t(`internationalCompetition.navigation.${possibleTextKey}`),
          href: this.localePath(`national-teams-competitions-competition-${possibleTextKey}`),
        });
      }
    }
    if (this.competition.teams.length) {
      this.navigation.push({
        name: this.$t('internationalCompetition.navigation.teams'),
        href: this.localePath('national-teams-competitions-competition-teams'),
      });
    }
  },
  head(): MetaInfo {
    const title = this.fullName;
    const description = this.$t('internationalCompetition.shortDescription', { name: this.fullName }).toString();

    // TODO: Add a specific Open graph image to the national team competition model
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
    fullName(): string {
      if (!this.competition) {
        return '';
      }
      return `${this.competition.name} ${this.competition.year}`;
    },
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
