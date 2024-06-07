<template>
  <div>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <div v-else class="c-standings__table-container">
      <table class="c-standings__table">
        <thead>
          <tr>
            <th
              v-for="(value, index) of standingsHeader"
              :key="index"
              class="c-standings__table-cell c-standings__table-cell--header"
            >
              {{ value }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(standing, index) of standings" :key="standing.team ? standing.team.id : `unknown-${index}`">
            <td class="c-standings__table-cell">{{ standing.position }}</td>
            <td v-if="standing.team" class="c-standings__table-cell">
              <div class="c-standings__team">
                <img
                  v-if="standing.team.avatarMediumUrl"
                  :src="standing.team.avatarMediumUrl"
                  class="c-standings__team-avatar"
                />
                <div v-else class="c-standings__team-avatar c-standings__team-avatar--placeholder"></div>
                {{ standing.team.name }}
              </div>
            </td>
            <td v-for="statKey of standingsStatKeys" :key="statKey" class="c-standings__table-cell">
              {{ getStatValueForKey(standing, statKey) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Season from '~/models/season.model';
import type Phase from '~/models/phase.model';
import Team from '~/models/team.model';
import type CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType, type LeveradeStandings, type LeveradeTeam } from '~/plugins/07.leverade';

interface StandingRow<T> {
  position: number;
  team: T | undefined;
  stats: LeveradeStandings['standingsrows'][0]['standingsstats'];
}

const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
const { $leverade } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]/classement',
    de: '/wettbewerbe/[competition]/[season]/[phase]/tabelle',
  },
});

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
  },
});

const {
  data: rawStandings,
  pending: fetchPending,
  error: fetchError,
  refresh,
} = useAsyncData<StandingRow<LeveradeTeam>[]>(
  'standings',
  async () => {
    // If we're not in a league phase (e.g. play-off phase), we redirect to the results
    if (props.phase.type !== LeveradeGroupType.LEAGUE) {
      const resultsPath = localePath({
        name: 'competitions-competition-season-phase-results',
      });
      navigateTo(resultsPath);
    }

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

useHead(() => {
  const title = t('competitions.headTitle.standings', {
    phaseName: props.phase.name,
    editionName: props.competitionEdition.name,
    seasonName: props.season.name,
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.standings').toString(),
      },
    ],
  };
});

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

const standings = computed<StandingRow<Team>[]>(() => {
  return rawStandings.value.map((standingRow) => ({
    position: standingRow.position,
    team: standingRow.team ? new Team(standingRow.team) : undefined,
    stats: standingRow.stats,
  }));
});

const getStatValueForKey = (standing: StandingRow<Team>, statKey: string): number => {
  return standing.stats.find((stat) => stat.type === statKey)?.value || 0;
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
.c-standings__table-container {
  width: 100%;
  overflow-x: scroll;
}

.c-standings__table {
  margin-top: var(--st-length-spacing-s);
  border-collapse: collapse;
  width: 100%;
}

.c-standings__table-cell {
  padding: var(--st-length-spacing-xxs);
  border-bottom: 1px solid grey;
  text-align: center;
}

/* Ranking cell */
.c-standings__table-cell:nth-child(1) {
  font-weight: bold;
  width: 2rem;
}

/* Team name cell */
.c-standings__table-cell:nth-child(2) {
  text-align: left;
  font-weight: bold;
  white-space: nowrap;
}

.c-standings__table-cell--header {
  color: grey;
  font-weight: bold;
  font-size: 0.8em;
}

.c-standings__team {
  display: flex;
  align-items: center;
}

.c-standings__team-avatar {
  width: 50px;
  height: 50px;
  margin-right: var(--st-length-spacing-xs);
}
</style>
