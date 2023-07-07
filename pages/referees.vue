<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('referees.title') }}</h2>

    <template v-if="level3Referees.length > 0">
      <h2 class="t-headline-2">{{ $t('referees.level.iii') }}</h2>
      <ul class="u-unstyled-list c-referees__list">
        <li v-for="referee in level3Referees" :key="referee.id">{{ referee.firstName }} {{ referee.lastName }}</li>
      </ul>
    </template>

    <template v-if="level2Referees.length > 0">
      <h2 class="t-headline-2">{{ $t('referees.level.ii') }}</h2>
      <ul class="u-unstyled-list c-referees__list">
        <li v-for="referee in level2Referees" :key="referee.id">{{ referee.firstName }} {{ referee.lastName }}</li>
      </ul>
    </template>

    <template v-if="level1Referees.length > 0">
      <h2 class="t-headline-2">{{ $t('referees.level.i') }}</h2>
      <ul class="u-unstyled-list c-referees__list">
        <li v-for="referee in level1Referees" :key="referee.id">{{ referee.firstName }} {{ referee.lastName }}</li>
      </ul>
    </template>

    <template v-if="level0Referees.length > 0">
      <h2 class="t-headline-2">{{ $t('referees.level.zero') }}</h2>
      <ul class="u-unstyled-list c-referees__list">
        <li v-for="referee in level0Referees" :key="referee.id">{{ referee.firstName }} {{ referee.lastName }}</li>
      </ul>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/arbitres',
      de: '/schiedsrichter',
    },
  },
  data() {
    return {
      referees: [],
    };
  },
  async fetch() {
    const response = await this.$axios('/external/referees_public.json');
    this.referees = response.data;
  },
  computed: {
    level0Referees(): any[] {
      return this.referees.filter((referee: any) => referee.levelId === '305');
    },
    level1Referees(): any[] {
      return this.referees.filter((referee: any) => referee.levelId === '304');
    },
    level2Referees(): any[] {
      return this.referees.filter((referee: any) => referee.levelId === '303');
    },
    level3Referees(): any[] {
      return this.referees.filter((referee: any) => referee.levelId === '302');
    },
  },
});
</script>

<style scoped>
.c-referees__list {
  text-align: center;
  line-height: 1.5;
}
</style>
