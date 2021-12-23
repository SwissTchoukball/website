<template>
  <st-person
    :name="`${person.first_name} ${person.last_name}`"
    :avatar-asset-id="person.portrait_square_head"
    :details="details"
  >
    <template #subName>
      <ul class="u-unstyled-list">
        <li
          v-for="role of roles"
          :key="role.id"
          v-tooltip.bottom="getTooltipForRole(role)"
          class="c-staff-person__role"
          :class="{ 'c-staff-person__role--main': (role.pivot && role.pivot.main) || roles.length === 1 }"
        >
          {{ role.getNameForPerson(person) }}
        </li>
      </ul>
    </template>
  </st-person>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import stPerson, { PersonDetail } from '~/components/people/st-person.vue';
import Person from '~/models/person.model';
import Role from '~/models/role.model';

export default Vue.extend({
  components: { stPerson },
  props: {
    person: {
      type: Object as PropType<Person>,
      required: true,
    },
    forGroupId: {
      type: Number,
      default: null,
    },
  },
  computed: {
    details(): PersonDetail[] {
      const details = [];
      if (this.person.email) {
        details.push({
          icon: 'envelope',
          text: this.person.email,
          href: `mailto:${this.person.email}`,
        });
      }
      return details;
    },
    roles(): Role[] {
      let roles = [...this.person.roles];
      if (this.forGroupId) {
        roles = roles.filter((role) => role.group?.id === this.forGroupId);
      }
      // Put main role first, then order by group ID
      roles.sort((roleA, roleB) => {
        if (roleA.pivot?.main) {
          return -1;
        } else if (roleB.pivot?.main) {
          return 1;
        }
        return roleA.group?.id - roleB.group?.id;
      });
      return roles;
    },
  },
  methods: {
    getTooltipForRole(role: Role) {
      if (!role.group) {
        return;
      }
      return {
        content: role.group.name,
      };
    },
  },
});
</script>

<style scoped>
.c-staff-person__role {
  font-weight: normal;
  margin-bottom: 0.2rem;
}

.c-staff-person__role--main {
  font-weight: bold;
}
</style>
