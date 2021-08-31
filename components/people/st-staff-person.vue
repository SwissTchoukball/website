<template>
  <st-person
    :name="`${person.first_name} ${person.last_name}`"
    :avatar-asset-id="person.portrait_square_head"
    :details="details"
  >
    <template #subName>
      <div v-for="role of roles" :key="role.id">
        {{ role.getNameForPerson(person) }}
        <span v-if="showGroupName && role.group" class="c-staff-person__group-name">· {{ role.group.name }}</span>
      </div>
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
      return [
        {
          icon: 'envelope',
          text: this.person.email,
          href: `mailto:${this.person.email}`,
        },
      ];
    },
    roles(): Role[] {
      if (!this.forGroupId) {
        return this.person.roles;
      } else {
        return this.person.roles.filter((role) => role.group.id === this.forGroupId);
      }
    },
    showGroupName(): boolean {
      return !this.forGroupId;
    },
  },
});
</script>

<style scoped>
.c-staff-person__group-name {
  font-weight: normal;
}
</style>
