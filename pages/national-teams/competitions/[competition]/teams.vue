<template>
  <div>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <st-national-team-competition-team-list v-else-if="teams" :teams="teams" />
  </div>
</template>

<script setup lang="ts">
import type {
  NationalTeamCompetition,
  NationalTeamForCompetition,
} from '~/components/national-teams/st-national-teams.prop';

const { $cmsService } = useNuxtApp();
const nationalTeamsStore = useNationalTeamsStore();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/competitions/[competition]/equipes',
    de: '/nationalteams/wettbewerbe/[competition]/teams',
  },
});

const props = defineProps({
  competition: {
    type: Object as PropType<NationalTeamCompetition>,
    required: true,
  },
});

// We load the positions only if we don't have them already
if (!nationalTeamsStore.playerPositions) {
  nationalTeamsStore.loadPlayerPositions();
}

const {
  data: teams,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<Omit<NationalTeamForCompetition, 'competition'>[]>(
  'teams',
  () => $cmsService.getNationalTeamsForCompetition(props.competition.id),
  { default: () => [] },
);
</script>
