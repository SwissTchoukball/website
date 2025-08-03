<template>
  <st-person
    :name="`${person.first_name} ${person.last_name}`"
    :avatar-asset-id="person.portrait_square_head"
    :details="details"
  >
    <template #subName>
      <ul v-if="rolesInGroup.length" class="c-staff-person__role-list">
        <li
          v-for="role of rolesInGroup"
          :key="role.id"
          class="c-staff-person__role"
          :class="{ 'c-staff-person__role--main': (role.pivot && role.pivot.main) || rolesInGroup.length === 1 }"
        >
          {{ getRoleNameForPerson(role, person) }}
        </li>
      </ul>
      <component :is="otherRolesWrapperComponent" v-if="rolesNotInGroup.length">
        <summary v-if="forGroupId" class="c-staff-person__other-roles-title">
          {{ $t('person.rolesOutsideOf', { groupName: rolesInGroup[0].group?.name }) }}
        </summary>
        <ul class="c-staff-person__role-list">
          <li v-for="role of rolesNotInGroup" :key="role.id" class="c-staff-person__role">
            <st-tooltip position="bottom" :disabled="!role.group" trigger-as="span">
              <template #trigger>{{ getRoleNameForPerson(role, person) }}</template>
              <template #content>{{ getTooltipForRole(role) }}</template>
            </st-tooltip>
          </li>
        </ul>
      </component>
    </template>
  </st-person>
</template>

<script setup lang="ts">
import stPerson, { type PersonDetail } from '~/components/people/st-person.vue';
import { Gender, type Person, type Role } from '~/plugins/08.cms-service';

const props = defineProps({
  person: {
    type: Object as PropType<Person>,
    required: true,
  },
  forGroupId: {
    type: Number,
    default: null,
  },
});

const details = computed<PersonDetail[]>(() => {
  const details = [];
  if (props.person.email) {
    details.push({
      icon: 'envelope',
      text: props.person.email,
      href: `mailto:${props.person.email}`,
    });
  }
  return details;
});

const otherRolesWrapperComponent = computed(() => {
  return props.forGroupId ? 'details' : 'div';
});

/**
 * Sorts roles by putting the main role first, then ordering by group ID.
 */
const sortRoles = (roles: Role[]) => {
  return roles.toSorted((roleA, roleB) => {
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
};

const rolesInGroup = computed(() =>
  sortRoles([...props.person.roles].filter((role) => role.group?.id && role.group.id === props.forGroupId)),
);

const rolesNotInGroup = computed(() =>
  sortRoles([...props.person.roles].filter((role) => !role.group || role.group.id !== props.forGroupId)),
);

const getRoleNameForPerson = (role: Role, person: Person): string => {
  if (person.gender === Gender.Female) {
    return role.name_feminine || role.name;
  } else if (person.gender === Gender.Male) {
    return role.name_masculine || role.name;
  }
  return role.name;
};

const getTooltipForRole = (role: Role) => {
  if (!role.group) {
    return;
  }
  return role.group.name;
};
</script>

<style scoped>
.c-staff-person__role-list {
  list-style-type: '\2726  ';
  padding-left: var(--st-length-spacing-xs);
  padding-left: 1rem;

  ::marker {
    color: var(--st-color-person-role-list-marker);
  }
}

.c-staff-person__other-roles-title {
  margin-top: var(--st-length-spacing-xs);
  padding-bottom: var(--st-length-spacing-xxs);
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.7rem;
  cursor: pointer;
}

.c-staff-person__role {
  font-weight: normal;
  margin-bottom: 0.2rem;
}

.c-staff-person__role--main {
  font-weight: bold;
}
</style>
