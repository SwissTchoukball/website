<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('referees.title') }}</h2>

    <StLoader v-if="fetchPending" main />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>

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

<script setup lang="ts">
defineI18nRoute({
  paths: {
    fr: '/arbitres',
    de: '/schiedsrichter',
  },
});

interface PublicReferee {
  id: string;
  firstName: string;
  lastName: string;
  levelId: string;
}

const {
  data: referees,
  pending: fetchPending,
  error: fetchError,
} = useFetch<PublicReferee[]>('/external/referees_public.json', {
  server: false,
});

const level0Referees = computed<PublicReferee[]>(() => {
  return referees.value?.filter((referee: PublicReferee) => referee.levelId === '305') || [];
});
const level1Referees = computed<PublicReferee[]>(() => {
  return referees.value?.filter((referee: PublicReferee) => referee.levelId === '304') || [];
});
const level2Referees = computed<PublicReferee[]>(() => {
  return referees.value?.filter((referee: PublicReferee) => referee.levelId === '303') || [];
});
const level3Referees = computed<PublicReferee[]>(() => {
  return referees.value?.filter((referee: PublicReferee) => referee.levelId === '302') || [];
});
</script>

<style scoped>
.c-referees__list {
  text-align: center;
  line-height: 1.5;
}
</style>
