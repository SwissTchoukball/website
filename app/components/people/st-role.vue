<template>
  <div v-if="role.holders && role.holders.length" class="c-role">
    <h3 v-if="!roleAsSubname" class="c-role__title t-headline-2">{{ nameForHolders }}</h3>
    <st-person
      v-for="holder in role.holders"
      :key="holder.id"
      :name="`${holder.first_name} ${holder.last_name}`"
      :sub-name="roleAsSubname ? nameForHolders : undefined"
      :avatar-asset-id="holder.portrait_square_head"
      :details="getHolderDetails(holder)"
      class="c-role__person"
    />
  </div>
</template>

<script setup lang="ts">
import stPerson, { type PersonDetail } from '~/components/people/st-person.vue';
import { Gender, type Person, type Role, type RoleWithPartialGroupAndHolders } from '~/plugins/08.cms-service';

const props = defineProps({
  role: {
    type: Object as PropType<Role | RoleWithPartialGroupAndHolders>,
    required: true,
  },
  roleAsSubname: Boolean,
});

const nameForHolders = computed<string>(() => {
  if (props.role.name_feminine && props.role.holders?.every((holder) => holder.gender === Gender.Female)) {
    return props.role.name_feminine;
  }
  if (props.role.name_masculine && props.role.holders?.every((holder) => holder.gender === Gender.Male)) {
    return props.role.name_masculine;
  }
  return props.role.name;
});

const getHolderDetails = (holder: Person | Partial<Person> | undefined): PersonDetail[] => {
  const details = [];
  if (holder?.email) {
    details.push({
      icon: 'envelope',
      text: holder.email,
      href: `mailto:${holder.email}`,
    });
  }
  return details;
};
</script>

<style scoped>
.c-role__title {
  margin-bottom: var(--st-length-spacing-s);
  padding-top: 0;
}

.c-role__person {
  margin-top: var(--st-length-spacing-s);
}
</style>
