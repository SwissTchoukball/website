<template>
  <div class="c-category-distribution-table">
    <table class="l-table c-category-distribution-table__table">
      <tbody>
        <tr>
          <th rowspan="2">{{ $t('categoryDistribution.birthYear') }}</th>
          <th rowspan="2">{{ $t('categoryDistribution.ageIn', { year: seasonStartYear }) }}</th>
          <th colspan="3">{{ $t('categoryDistribution.categories') }}</th>
        </tr>

        <tr>
          <th>{{ $t('categoryDistribution.competitions') }}</th>
          <th>{{ $t('categoryDistribution.youthAndSport') }}</th>
          <th>{{ $t('categoryDistribution.federation') }}</th>
        </tr>

        <tr v-for="(age, index) in ages" :key="age">
          <td>
            <template v-if="index === 0">
              {{ $t('categoryDistribution.yearAndLess', { year: seasonStartYear - age }) }}
            </template>
            <template v-else>{{ seasonStartYear - age }}</template>
          </td>

          <td>{{ age }}<span v-if="index === 0">+</span></td>

          <template v-if="age === 21">
            <td rowspan="4">Adultes</td>
            <td>-</td>
            <td rowspan="2">Membres actifs</td>
          </template>
          <td v-else-if="age === 20" rowspan="10">Sport des jeunes</td>
          <td v-else-if="age === 19" rowspan="15">Membres juniors</td>
          <td v-else-if="age === 17" rowspan="3">M18</td>
          <td v-else-if="age === 14" rowspan="3">M15</td>
          <td v-else-if="age === 11" rowspan="2">M12</td>
          <td v-else-if="age === 10" rowspan="6">Sport des enfants</td>
          <td v-else-if="age === 9" rowspan="2">M10</td>
          <td v-else-if="age === 7" rowspan="3">M8</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    seasonStartYear: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ages(): number[] {
      return Array.from({ length: 17 }, (_v, k) => k + 5).reverse();
    },
  },
});
</script>

<style scoped>
.c-category-distribution-table {
  width: 100%;
  overflow-x: scroll;
}

.c-category-distribution-table__table {
  min-width: 560px;
}

.c-category-distribution-table__table th {
  background: var(--st-color-table-border);
  text-align: center;
  border: 1px solid white;
}

.c-category-distribution-table__table td {
  border: 1px solid var(--st-color-table-border);
  text-align: center;
}
</style>
