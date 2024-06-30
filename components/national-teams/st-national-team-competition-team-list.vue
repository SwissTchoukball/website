<template>
  <div>
    <ul v-if="teams.length > 1" class="u-unstyled-list c-national-team-competition-team-list__shortcuts">
      <li v-for="nationalCompetitionTeam in teams" :key="`team-${nationalCompetitionTeam.id}`">
        <a :href="`#${nationalCompetitionTeam.team.slug}`">{{ nationalCompetitionTeam.team.name }}</a>
      </li>
    </ul>
    <div
      v-for="nationalCompetitionTeam in teams"
      :key="`team-${nationalCompetitionTeam.id}`"
      class="c-national-team-competition-team-list__team"
    >
      <h3
        :id="nationalCompetitionTeam.team.slug"
        class="t-headline-2 c-national-team-competition-team-list__team-title"
      >
        {{ nationalCompetitionTeam.team.name }} – {{ $t('internationalCompetition.teams.selection') }}
      </h3>
      <ul v-if="nationalCompetitionTeam.players.length" class="u-unstyled-list l-people-list">
        <li v-for="player of nationalCompetitionTeam.players" :key="player.id" class="l-people-list__person">
          <st-player :player="player" />
        </li>
      </ul>
      <h4 class="t-headline-3">
        {{ $t('internationalCompetition.teams.coach', nationalCompetitionTeam.coaches.length) }}
      </h4>
      <ul v-if="nationalCompetitionTeam.coaches.length" class="u-unstyled-list l-people-list">
        <li v-for="coach of nationalCompetitionTeam.coaches" :key="coach.id" class="l-people-list__person">
          <st-person
            :name="`${coach.first_name} ${coach.last_name}`"
            :sub-name="$t('internationalCompetition.teams.coach', 1)"
            :avatar-asset-id="coach.portrait_square_head"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NationalTeamForCompetition } from './st-national-teams.prop';
import StPlayer from '~/components/national-teams/st-player.vue';
import StPerson from '~/components/people/st-person.vue';

defineProps({
  teams: {
    type: Array as PropType<Omit<NationalTeamForCompetition, 'competition'>[]>,
    required: true,
  },
});
</script>

<style scoped>
.c-national-team-competition-team-list__shortcuts li {
  margin-top: var(--st-length-spacing-xxs);
}

.c-national-team-competition-team-list__team:not(:first-of-type) .c-national-team-competition-team-list__team-title {
  margin-top: var(--st-length-spacing-l);
}
</style>
