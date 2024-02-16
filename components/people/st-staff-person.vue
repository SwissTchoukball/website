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
          {{ getRoleNameForPerson(role, person) }}
        </li>
      </ul>
    </template>
  </st-person>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import stPerson, { PersonDetail } from '~/components/people/st-person.vue';
import { Gender, Person, Role } from '~/plugins/cms-service';

export default defineComponent({
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

        if (roleA.group?.id && roleB.group?.id) {
          return roleA.group?.id - roleB.group?.id;
        } else if (roleA.group?.id && !roleB.group?.id) {
          return -1;
        } else if (roleB.group?.id) {
          return 1;
        }
        return 0;
      });
      return roles;
    },
  },
  methods: {
    getRoleNameForPerson(role: Role, person: Person): string {
      if (person.gender === Gender.Female) {
        return role.name_feminine || role.name;
      } else if (person.gender === Gender.Male) {
        return role.name_masculine || role.name;
      }
      return role.name;
    },
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
