<template>
  <st-person
    :name="`${player.first_name} ${player.last_name}`"
    :sub-name="subName"
    :avatar-asset-id="player.portrait_square_head"
    :details="details"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import stPerson, { PersonDetail } from '~/components/people/st-person.vue';
import { Player } from '~/components/national-teams/st-national-teams.prop';
import { Gender } from '~/plugins/08.cms-service';

export default defineComponent({
  components: { stPerson },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  computed: {
    subName(): string | undefined {
      return this.player.is_captain ? this.$t('nationalTeams.captain').toString() : undefined;
    },
    details(): PersonDetail[] {
      const details = [];
      if (this.player.number) {
        details.push({
          icon: 'hashtag',
          text: this.$t('nationalTeams.number', { number: this.player.number }).toString(),
        });
      }

      if (this.player.birth_year) {
        details.push({
          icon: 'asterisk',
          text: this.$t(`nationalTeams.bornIn.${this.player.gender}`, { year: this.player.birth_year }).toString(),
        });
      }

      if (this.player.club?.name) {
        details.push({
          icon: 'shield-halved',
          text: this.player.club.name,
        });
      }

      if (this.player.positions.length && this.$store.state.playerPositions) {
        let name_gender = 'name';
        if (this.player.gender === Gender.Female) {
          name_gender = 'name_feminine';
        } else if (this.player.gender === Gender.Male) {
          name_gender = 'name_masculine';
        }
        details.push({
          icon: 'circle-dot',
          text: this.player.positions
            .map((positionId) => {
              const genderSpecificPosition = this.$store.state.playerPositions[positionId][name_gender];
              return genderSpecificPosition || this.$store.state.playerPositions[positionId].name;
            })
            .join(', '),
        });
      }

      if (this.player.date_start) {
        details.push({
          icon: 'circle-play',
          text: this.$t('nationalTeams.inTeamSince', { year: this.player.date_start.substring(0, 4) }).toString(),
        });
      }

      if (this.player.track_record) {
        details.push({
          icon: 'award',
          text: this.$t('nationalTeams.trackRecord').toString(),
          body: this.player.track_record,
        });
      }

      return details;
    },
  },
});
</script>
