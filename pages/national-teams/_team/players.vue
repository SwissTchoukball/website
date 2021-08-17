<template>
  <div>
    <ul v-if="team.players.length" class="u-unstyled-list c-players__list">
      <li v-for="player of team.players" :key="player.id" class="c-players__player">
        <st-player :player="player" />
      </li>
    </ul>
    <p v-else class="c-players__no-players">{{ $t('nationalTeams.noPlayers') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Team } from '~/components/national-teams/st-national-teams.prop';
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
      type: Object as PropType<Team>,
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
});
</script>

<style scoped>
.c-players__list {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.c-players__player {
  margin-top: var(--st-length-spacing-m);
  width: 100%;
}

.c-players__no-players {
  margin-top: var(--st-length-spacing-m);
  text-align: center;
}

@media (--sm-and-up) {
  .c-players__player {
    width: 50%;
  }
}
</style>
