<template>
  <div>
    <ul v-if="team.staff.length" class="u-unstyled-list l-people-list">
      <li v-for="person of team.staff" :key="person.id" class="l-people-list__person">
        <st-person
          :name="`${person.first_name} ${person.last_name}`"
          :sub-name="person.role"
          :avatar-asset-id="person.portrait_square_head"
          :details="generateDetails(person)"
        />
      </li>
    </ul>
    <p v-else class="l-blank-slate-message">{{ $t('nationalTeams.noStaff') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { StaffMember, NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import stPerson from '~/components/people/st-person.vue';

export default Vue.extend({
  components: { stPerson },
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/:team/encadrement',
      de: '/nationalteams/:team/staff',
    },
  },
  props: {
    team: {
      type: Object as PropType<NationalTeam>,
      required: true,
    },
  },
  methods: {
    generateDetails(person: StaffMember) {
      const details = [];

      if (person.date_start) {
        details.push({
          icon: 'play-circle',
          text: this.$t('nationalTeams.hasRoleSince', { year: person.date_start.substring(0, 4) }).toString(),
        });
      }

      if (person.track_record) {
        details.push({
          icon: 'award',
          text: this.$t('nationalTeams.trackRecord').toString(),
          body: person.track_record,
        });
      }

      return details;
    },
  },
});
</script>
