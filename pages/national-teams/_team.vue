<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ team.name }}</h2>
      <img
        v-if="team.team_photo"
        class="c-team__photo"
        :style="`object-position: 0 ${teamPhotoVerticalShiftInPercentage}%;`"
        :alt="team.team_photo.description"
        :src="mainImageFallbackSrc"
        :srcset="mainImageSrcSet"
        :sizes="imgTagSizes"
      />
      <st-navigation
        :items="teamNavigation"
        class="c-team__navigation"
        :name="$t('otherNavigation', { name: team.name })"
        small
      />
      <nuxt-child :team="team" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/:team',
      de: '/nationalteams/:team',
    },
  },
  data() {
    return {
      team: undefined as NationalTeam | undefined,
      imgTagSizes: '',
    };
  },
  async fetch() {
    this.team = await this.$cmsService.getTeam(this.$route.params.team);
    if (this.team.slug !== this.$route.params.team) {
      // We are likely in a situation where the page was requested in a specific language,
      // but with the path in another language.
      // This can notably happen when using the language switcher.
      // We just redirect to fix the path.
      this.$router.replace(this.localePath({ name: 'national-teams-team', params: { team: this.team.slug } }));
    }
  },
  head(): MetaInfo {
    return {
      title: this.team?.name,
    };
  },
  computed: {
    mainImageFallbackSrc(): string {
      if (!this.team?.team_photo) {
        return '';
      }
      return getAssetURL(this.$config.cmsURL, this.team.team_photo.id, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    mainImageSrcSet(): string {
      if (!this.team?.team_photo) {
        return '';
      }
      return getAssetSrcSet(this.$config.cmsURL, this.team.team_photo.id, {
        widths: this.$config.keyVisualSizes,
      });
    },
    teamPhotoVerticalShiftInPercentage(): number {
      return this.team?.team_photo_vertical_shift || 0;
    },
    teamNavigation(): MenuItem[] {
      if (!this.team) {
        return [];
      }

      const teamNavigation: MenuItem[] = [];
      if (this.team.players.length) {
        teamNavigation.push({
          name: this.$t(`nationalTeams.navigation.players.${this.team.gender}`).toString(),
          href: this.localePath({ name: 'national-teams-team-players', params: { team: this.team.slug } }),
        });
      }

      if (this.team.staff.length) {
        teamNavigation.push({
          name: this.$t(`nationalTeams.navigation.staff`).toString(),
          href: this.localePath({ name: 'national-teams-team-staff', params: { team: this.team.slug } }),
        });
      }

      if (this.team.results.length) {
        teamNavigation.push({
          name: this.$t(`nationalTeams.navigation.results`).toString(),
          href: this.localePath({ name: 'national-teams-team-results', params: { team: this.team.slug } }),
        });
      }

      return teamNavigation;
    },
  },
  mounted() {
    const bodyStyles = window.getComputedStyle(document.body);
    const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoing-l-xl');
    this.imgTagSizes = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
  },
});
</script>

<style scoped>
.c-team__photo {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
  margin-top: var(--st-length-spacing-s);
  height: auto;
  object-fit: cover;
}

.c-team__navigation {
  margin-top: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .c-team__photo {
    max-height: min(50vw, 60vh);
  }
}

@media (--xl-and-up) {
  .c-team__photo {
    width: var(--st-breakpoing-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoing-l-xl) - var(--st-length-main-content-max-width)) / 2);
    max-height: 60vh;
  }
}
</style>
