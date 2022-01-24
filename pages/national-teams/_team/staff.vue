<template>
  <div>
    <ul v-if="staff.length" class="u-unstyled-list">
      <li v-for="role of staff" :key="role.id">
        <st-role :role="role" class="c-national-team-staff__role" />
      </li>
    </ul>
    <p v-else class="l-blank-slate-message">{{ $t('nationalTeams.noStaff') }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Item } from '@vuex-orm/core';
import { NationalTeam } from '~/components/national-teams/st-national-teams.prop';
import stRole from '~/components/people/st-role.vue';
import Role from '~/models/role.model';

export default Vue.extend({
  components: { stRole },
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
  head() {
    const title = this.$t(`nationalTeams.headTitle.staff`, { teamName: this.team.name.toLowerCase() }).toString();
    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t(`nationalTeams.description.staff`).toString(),
        },
      ],
    };
  },
  computed: {
    Role() {
      return this.$store.$db().model(Role);
    },
    staff(): Item<Role>[] {
      return this.team.staff.map((roleId: number) => this.Role.query().with('holders').whereId(roleId).first());
    },
  },
});
</script>

<style scoped>
.c-national-team-staff__role {
  margin-top: var(--st-length-spacing-m);
}
</style>
