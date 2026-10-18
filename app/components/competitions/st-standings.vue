<template>
  <table class="c-standings__table">
    <thead v-if="headers?.length">
      <tr>
        <th
          v-for="(value, index) of headers"
          :key="index"
          class="c-standings__table-cell c-standings__table-cell--header"
        >
          {{ value }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) of rows" :key="row.team ? row.team.id : `unknown-${index}`">
        <td class="c-standings__table-cell">{{ row.position }}</td>
        <td v-if="row.team" class="c-standings__table-cell">
          <div class="c-standings__team">
            <img v-if="row.team.avatarMediumUrl" :src="row.team.avatarMediumUrl" class="c-standings__team-avatar" />
            <div v-else class="c-standings__team-avatar c-standings__team-avatar--placeholder"></div>
            {{ row.team.name }}
          </div>
        </td>
        <td v-for="cell of row.columns" :key="cell" class="c-standings__table-cell">
          {{ cell }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type Team from '~/models/team.model';

interface StandingRow {
  position: number;
  team: Team | undefined;
  columns: (string | number)[];
}

defineProps<{
  headers?: string[];
  rows: StandingRow[];
}>();
</script>

<style scoped>
.c-standings__table {
  margin-top: var(--st-length-spacing-s);
  border-collapse: collapse;
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

tbody tr:first-child .c-standings__table-cell {
  border-top: 1px solid grey;
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
