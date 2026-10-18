<template>
  <div>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <div v-else class="c-phase-standings">
      <st-standings :headers="standingsHeader" :rows="standings" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type Season from '~/models/season.model';
import type Phase from '~/models/phase.model';
import Team from '~/models/team.model';
import type CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType, type LeveradeStandings, type LeveradeTeam } from '~/plugins/07.leverade';

const route = useRoute();
const { t } = useI18n();
const { $leverade } = useNuxtApp();

const props = defineProps({
  season: {
    type: Object as PropType<Season>,
    required: true,
  },
  competitionEdition: {
    type: Object as PropType<CompetitionEdition>,
    required: true,
  },
  phase: {
    type: Object as PropType<Phase>,
    required: true,
    validator(value: Phase) {
      return value.type === LeveradeGroupType.LEAGUE;
    },
  },
});

const {
  data: rawStandings,
  pending: fetchPending,
  error: fetchError,
  refresh,
} = useAsyncData<
  {
    position: number;
    team: LeveradeTeam | undefined;
    stats: LeveradeStandings['standingsrows'][0]['standingsstats'];
  }[]
>(
  `standings-${props.phase.id}`,
  async () => {
    const teamsResponse = await $leverade.getTeams(props.phase.competition_edition_id);
    const standingsResponse = await $leverade.getStandings(props.phase.id);
    return standingsResponse.meta.standingsrows.map((row) => ({
      position: row.position,
      team: teamsResponse.data.find((team) => +team.id === row.id),
      stats: row.standingsstats,
    }));
  },
  { default: () => [] },
);

const standingsHeader = computed<string[]>(() => {
  return [
    '',
    t('competitions.standings.header.team'),
    t('competitions.standings.header.played'),
    t('competitions.standings.header.won'),
    t('competitions.standings.header.drawn'),
    t('competitions.standings.header.lost'),
    t('competitions.standings.header.scored'),
    t('competitions.standings.header.received'),
    t('competitions.standings.header.diff'),
    t('competitions.standings.header.points'),
  ];
});

const standingsStatKeys = computed<string[]>(() => {
  return [
    'played_matches',
    'won_matches',
    'drawn_matches',
    'lost_matches',
    'value',
    'value_against',
    'value_difference',
    'score',
  ];
});

const standings = computed<
  {
    position: number;
    team: Team | undefined;
    columns: (string | number)[];
  }[]
>(() => {
  return rawStandings.value.map((standingRow) => ({
    position: standingRow.position,
    team: standingRow.team ? new Team(standingRow.team) : undefined,
    columns: standingsStatKeys.value.map((statKey) => getStatValueForKey(standingRow.stats, statKey)),
  }));
});

const getStatValueForKey = (
  stats: LeveradeStandings['standingsrows'][0]['standingsstats'],
  statKey: string,
): number => {
  return stats.find((stat) => stat.type === statKey)?.value || 0;
};

watch(route, async (newRoute, oldRoute) => {
  if (
    newRoute.params.phase !== oldRoute.params.phase ||
    newRoute.params.season !== oldRoute.params.season ||
    newRoute.params.competition !== oldRoute.params.competition
  ) {
    await refresh();
  }
});
</script>

<style scoped>
.c-phase-standings {
  width: 100%;
  overflow-x: scroll;
  display: flex;
  justify-content: center;
}
</style>
