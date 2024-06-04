<template>
  <st-person
    :name="`${player.first_name} ${player.last_name}`"
    :sub-name="subName"
    :avatar-asset-id="player.portrait_square_head"
    :details="details"
  />
</template>

<script setup lang="ts">
import stPerson, { type PersonDetail } from '~/components/people/st-person.vue';
import type { Player } from '~/components/national-teams/st-national-teams.prop';
import { Gender } from '~/plugins/08.cms-service';

const { t } = useI18n();
const nationalTeamsStore = useNationalTeamsStore();

const props = defineProps({
  player: {
    type: Object as PropType<Player>,
    required: true,
  },
});
const subName = computed<string | undefined>(() => {
  return props.player.is_captain ? t('nationalTeams.captain').toString() : undefined;
});

const details = computed<PersonDetail[]>(() => {
  const details = [];
  if (props.player.number) {
    details.push({
      icon: 'hashtag',
      text: t('nationalTeams.number', { number: props.player.number }).toString(),
    });
  }

  if (props.player.birth_year) {
    details.push({
      icon: 'asterisk',
      text: t(`nationalTeams.bornIn.${props.player.gender}`, { year: props.player.birth_year }).toString(),
    });
  }

  if (props.player.club?.name) {
    details.push({
      icon: 'shield-halved',
      text: props.player.club.name,
    });
  }

  if (props.player.positions.length && nationalTeamsStore.playerPositions) {
    let name_gender: 'name' | 'name_feminine' | 'name_masculine' = 'name';
    if (props.player.gender === Gender.Female) {
      name_gender = 'name_feminine';
    } else if (props.player.gender === Gender.Male) {
      name_gender = 'name_masculine';
    }
    details.push({
      icon: 'circle-dot',
      text: props.player.positions
        .map((positionId) => {
          const genderSpecificPosition = nationalTeamsStore.playerPositions![positionId][name_gender];
          return genderSpecificPosition || nationalTeamsStore.playerPositions![positionId].name;
        })
        .join(', '),
    });
  }

  if (props.player.date_start) {
    details.push({
      icon: 'circle-play',
      text: t('nationalTeams.inTeamSince', { year: props.player.date_start.substring(0, 4) }).toString(),
    });
  }

  if (props.player.track_record) {
    details.push({
      icon: 'award',
      text: t('nationalTeams.trackRecord').toString(),
      body: props.player.track_record,
    });
  }

  return details;
});
</script>
