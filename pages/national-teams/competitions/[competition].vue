<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchPending" :main="true" />
    <p v-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="!fetchPending && competition">
      <img :src="logoSrc" :srcset="logoSrcSet" class="competition-logo" />

      <h2 class="t-headline-1">{{ fullName }}</h2>

      <st-navigation
        :items="navigation"
        class="navigation"
        :name="$t('otherNavigation', { name: fullName })"
        selected-on-exact-active
        small
      />

      <NuxtPage :competition="competition" :navigation="navigation" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { NationalTeamCompetition } from '~/components/national-teams/st-national-teams.prop';
import { getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/competitions/[competition]',
    de: '/nationalteams/wettbewerbe/[competition]',
  },
});

const competition = ref<NationalTeamCompetition>();
const navigation = ref<MenuItem[]>([]);

const { pending: fetchPending, error: fetchError } = useAsyncData('competition', async () => {
  const competitionSlug = route.params.competition as string;
  competition.value = await $cmsService.getNationalTeamCompetition({ slug: competitionSlug });

  // Building navigation
  const possibleTexts = ['live', 'about', 'schedule', 'medias'] as const;
  for (const possibleTextKey of possibleTexts) {
    if (competition.value[possibleTextKey]) {
      navigation.value.push({
        name: t(`internationalCompetition.navigation.${possibleTextKey}`),
        href: localePath(`national-teams-competitions-competition-${possibleTextKey}`),
      });
    }
  }
  if (competition.value.teams.length) {
    navigation.value.push({
      name: t('internationalCompetition.navigation.teams'),
      href: localePath('national-teams-competitions-competition-teams'),
    });
  }
});

useHead(() => {
  const title = fullName.value;
  const description = t('internationalCompetition.shortDescription', { name: fullName.value }).toString();

  // TODO: Add a specific Open graph image to the national team competition model
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: description,
      },
    ],
  };
});

const fullName = computed<string>(() => {
  if (!competition.value) {
    return '';
  }
  return `${competition.value.name} ${competition.value.year}`;
});

const logoSrc = computed<string>(() => {
  if (!competition.value?.logo) {
    return '';
  }
  return getAssetURL(runtimeConfig.public.cmsURL, competition.value.logo, { width: 180 });
});

const logoSrcSet = computed<string>(() => {
  if (!competition.value?.logo) {
    return '';
  }
  return `${getAssetURL(runtimeConfig.public.cmsURL, competition.value.logo, {
    width: 360,
  })} 2x`;
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.competition-logo {
  margin: auto;
  display: block;
}

.navigation {
  margin-top: var(--st-length-spacing-s);
  margin-bottom: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .competition-logo {
    float: right;
  }
}
</style>
