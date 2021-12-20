<template>
  <div>
    <ul v-if="team.players.length" class="u-unstyled-list l-people-list">
      <li v-for="player of team.players" :key="player.id" class="l-people-list__person">
        <st-player :player="player" />
      </li>
    </ul>
    <p v-else class="l-blank-slate-message">{{ $t('nationalTeams.noPlayers') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import StPlayer from '~/components/national-teams/st-player.vue';

export default Vue.extend({
  components: { StPlayer },
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/:team/joueur-euse-s',
      de: '/nationalteams/:team/spieler-innen',
    },
  },
  props: {
    team: {
      type: Object as PropType<NationalTeam>,
      required: true,
    },
  },
  async fetch() {
    if (!this.team.players.length) {
      this.$router.replace(this.localePath({ name: 'national-teams-team-staff', params: { team: this.team.slug } }));
    }
    // We load the positions only if we don't have them already
    if (!this.$store.state.playerPositions) {
      await this.$store.dispatch('loadPlayerPositions');
    }
  },
  head() {
    return {
      title: this.$t(`nationalTeams.headTitle.players.${this.team.gender}`, {
        teamName: this.team.name.toLowerCase(),
      }).toString(),
    };
  },
});
</script>
