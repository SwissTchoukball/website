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

<script setup lang="ts">
import type { NationalTeam } from '~/components/national-teams/st-national-teams.prop';

const router = useRouter();
const { t } = useI18n();
const localePath = useLocalePath();
const nationalTeamsStore = useNationalTeamsStore();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/[team]/joueur-euse-s',
    de: '/nationalteams/[team]/spieler-innen',
  },
});

const props = defineProps({
  team: {
    type: Object as PropType<NationalTeam>,
    required: true,
  },
});

if (!props.team.players.length) {
  router.replace(localePath({ name: 'national-teams-team-staff', params: { team: props.team.slug } }));
}
// We load the positions only if we don't have them already
if (!nationalTeamsStore.playerPositions) {
  await nationalTeamsStore.loadPlayerPositions();
}

useHead(() => {
  const title = t(`nationalTeams.headTitle.players.${props.team.gender}`, {
    teamName: props.team.name.toLowerCase(),
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t(`nationalTeams.description.players.${props.team.gender}`).toString(),
      },
    ],
  };
});
</script>
