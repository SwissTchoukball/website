<template>
  <div>
    <ul v-if="team.staff.length" class="u-unstyled-list">
      <li v-for="role of team.staff" :key="role.id">
        <st-role :role="role" class="c-national-team-staff__role" />
      </li>
    </ul>
    <p v-else class="l-blank-slate-message">{{ $t('nationalTeams.noStaff') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { NationalTeam } from '~/components/national-teams/st-national-teams.prop';

const { t } = useI18n();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/[team]/encadrement',
    de: '/nationalteams/[team]/staff',
  },
});

const props = defineProps({
  team: {
    type: Object as PropType<NationalTeam>,
    required: true,
  },
});

useHead(() => {
  const title = t(`nationalTeams.headTitle.staff`, {
    teamName: props.team.name.toLowerCase(),
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t(`nationalTeams.description.staff`).toString(),
      },
    ],
  };
});
</script>

<style scoped>
.c-national-team-staff__role {
  margin-top: var(--st-length-spacing-m);
}
</style>
