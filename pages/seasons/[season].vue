<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-season__breadcrumb" />
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="season">
      <h2 class="t-headline-1">{{ $t('season.name', 1) }} {{ season.name }}</h2>
      <h3 class="t-headline-2">{{ $t('competitions.title') }}</h3>
      <st-link-list
        :items="competitionEditionsNavigation"
        :name="$t('otherNavigation', { name: `${$t('competitions.title')} ${season.name}` })"
        class="c-season__competition-list"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import CompetitionEdition from '~/models/competition-edition.model';
import type Season from '~/models/season.model';
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const { $cmsService } = useNuxtApp();
const seasonsStore = useSeasonsStore();

defineI18nRoute({
  paths: {
    fr: '/saisons/[season]',
    de: '/saisonen/[season]',
  },
});

const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'seasons',
    displayName: t('season.name', 2),
  },
]);

const {
  data: rawCompetitionEditions,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<NationalCompetitionEdition[]>(
  'nationalCompetitionEditions',
  async () => {
    try {
      return await $cmsService.getNationalCompetitionEditions({
        seasonSlug: route.params.season as string,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Could not load the competitions for this season');
    }
  },
  { default: () => [] },
);

const season = computed<Season | undefined>(() => {
  return seasonsStore.getSeasonBySlug(route.params.season as string);
});

const competitionEditions = computed<CompetitionEdition[]>(() => {
  return rawCompetitionEditions.value.map(
    (rawCompetitionEdition) => new CompetitionEdition(rawCompetitionEdition, season.value),
  );
});

const competitionEditionsNavigation = computed<MenuItem[]>(() => {
  return competitionEditions.value.map((competitionEdition) => {
    return {
      name: competitionEdition.name,
      href: localePath({
        name: 'competitions-competition-season',
        params: { season: season.value?.slug || '', competition: competitionEdition.competition.slug },
      }),
    };
  });
});
</script>

<style scoped>
.c-season__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-season__competition-list {
  margin-top: var(--st-length-spacing-s);
}
</style>
