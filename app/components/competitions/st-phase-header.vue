<template>
  <st-breadcrumb :items="breadcrumb" class="c-phase-header__breadcrumb" />

  <h2 class="t-headline-1 c-phase-header__title">
    <nuxt-link :to="localePath({ name: 'competitions-competition-season' })">
      {{ competitionEdition.name }}
    </nuxt-link>
  </h2>
  <st-phase-navigation :competition-edition="competitionEdition" class="c-phase-header__phases-navigation" />

  <h3 v-if="phase?.group" class="t-headline-2">{{ phase.name }}</h3>
</template>

<script lang="ts" setup>
import type CompetitionEdition from '~/models/competition-edition.model';
import type Phase from '~/models/phase.model';
import type { BreadcrumbItem } from '../st-breadcrumb.vue';

const localePath = useLocalePath();
const { t } = useI18n();

const {
  competitionEdition,
  phase = undefined,
  additionalBreadcrumbItems = [],
} = defineProps<{
  competitionEdition: CompetitionEdition;
  phase?: Phase;
  additionalBreadcrumbItems?: BreadcrumbItem[];
}>();

const breadcrumb = computed<BreadcrumbItem[]>(() => {
  const builtBreadcrumb: BreadcrumbItem[] = [
    {
      pageName: 'seasons',
      displayName: t('season.name', 2),
    },
  ];

  if (competitionEdition) {
    if (competitionEdition.season) {
      builtBreadcrumb.push(
        ...[
          {
            displayName: competitionEdition.season.name,
            pageName: 'seasons-season',
          },
        ],
      );
    }

    builtBreadcrumb.push({
      displayName: competitionEdition.name,
      pageName: 'competitions-competition-season',
    });

    if (phase && competitionEdition.name !== phase.name) {
      builtBreadcrumb.push({
        displayName: phase.name,
        pageName: 'competitions-competition-season-phase',
        pageParams: {
          phase: phase.id,
        },
      });
    }
  }

  if (additionalBreadcrumbItems.length > 0) {
    builtBreadcrumb.push(...additionalBreadcrumbItems);
  }

  return builtBreadcrumb;
});
</script>

<style scoped>
.c-phase-header__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-phase-header__title a {
  color: initial;
}

.c-phase-header__phases-navigation {
  margin-top: var(--st-length-spacing-xs);
}
</style>
