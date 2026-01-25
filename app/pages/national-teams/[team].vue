<template>
  <section class="l-main-content-section">
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
    <template v-else-if="team">
      <h2 class="t-headline-1">{{ team.name }}</h2>
      <img
        v-if="team.team_photo"
        class="c-team__photo"
        :style="`object-position: 0 ${teamPhotoVerticalShiftInPercentage}%;`"
        :alt="team.team_photo.description || undefined"
        :src="mainImageFallbackSrc"
        :srcset="mainImageSrcSet"
        :sizes="imgTagSizes"
      />
      <st-navigation
        :items="teamNavigation"
        class="c-team__navigation"
        :name="$t('otherNavigation', { name: team.name })"
        small
      />
      <NuxtPage :team="team" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/[team]',
    de: '/nationalteams/[team]',
  },
});

const imgTagSizes = ref('');

const {
  data: team,
  pending: fetchPending,
  error: fetchError,
} = useAsyncData<NationalTeam>(`team-${route.params.team as string}-${locale.value}`, async () => {
  const teamData = await $cmsService.getTeam(route.params.team as string);
  if (teamData.slug !== route.params.team) {
    // We are likely in a situation where the page was requested in a specific language,
    // but with the path in another language.
    // This can notably happen when using the language switcher.
    // We just redirect to fix the path.
    router.replace(localePath({ name: 'national-teams-team', params: { team: teamData.slug } }));
  }

  return teamData;
});

useHead(() => {
  return {
    title: team.value?.name,
  };
});

const mainImageFallbackSrc = computed<string>(() => {
  if (!team.value?.team_photo) {
    return '';
  }
  return getAssetURL(runtimeConfig.public.cmsURL, team.value.team_photo.id, {
    width: appConfig.keyVisualSizes[0]!,
  });
});

const mainImageSrcSet = computed<string>(() => {
  if (!team.value?.team_photo) {
    return '';
  }
  return getAssetSrcSet(runtimeConfig.public.cmsURL, team.value.team_photo.id, {
    widths: appConfig.keyVisualSizes,
  });
});

const teamPhotoVerticalShiftInPercentage = computed<number>(() => {
  return team.value?.team_photo_vertical_shift || 0;
});

const teamNavigation = computed<MenuItem[]>(() => {
  if (!team.value) {
    return [];
  }

  const teamNavigation: MenuItem[] = [];
  if (team.value.players.length) {
    teamNavigation.push({
      name: t(`nationalTeams.navigation.players.${team.value.gender}`).toString(),
      href: localePath({ name: 'national-teams-team-players', params: { team: team.value.slug } }),
    });
  }

  if (team.value.staff.length) {
    teamNavigation.push({
      name: t(`nationalTeams.navigation.staff`).toString(),
      href: localePath({ name: 'national-teams-team-staff', params: { team: team.value.slug } }),
    });
  }

  if (team.value.results.length) {
    teamNavigation.push({
      name: t(`nationalTeams.navigation.results`).toString(),
      href: localePath({ name: 'national-teams-team-results', params: { team: team.value.slug } }),
    });
  }

  return teamNavigation;
});

onMounted(() => {
  const bodyStyles = window.getComputedStyle(document.body);
  const lXlBreakpoint = bodyStyles.getPropertyValue('--st-breakpoint-l-xl');
  imgTagSizes.value = `(min-width: ${lXlBreakpoint}) ${lXlBreakpoint}, 100vw`;
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-team__photo {
  width: 100vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
  margin-top: var(--st-length-spacing-s);
  height: auto;
  object-fit: cover;
}

.c-team__navigation {
  margin-top: var(--st-length-spacing-s);
}

@media (--xl-and-up) {
  .c-team__photo {
    width: var(--st-breakpoint-l-xl);
    margin-left: calc(-1 * (var(--st-breakpoint-l-xl) - var(--st-length-main-content-max-width)) / 2);
  }
}

@media (orientation: landscape) {
  .c-team__photo {
    aspect-ratio: 2 / 1;
  }

  @supports not (aspect-ratio: 2 / 1) {
    .c-team__photo::before {
      float: left;
      padding-top: 40%;
      content: '';
    }

    .c-team__photo::after {
      display: block;
      content: '';
      clear: both;
    }
  }
}
</style>
