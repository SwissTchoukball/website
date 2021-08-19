<template>
  <section class="l-main-content-section">
    <st-loader v-if="$fetchState.pending" main />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ team.name }}</h2>
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
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
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
  computed: {
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
});
</script>

<style scoped>
.c-team__navigation {
  margin-top: var(--st-length-spacing-s);
}
</style>
