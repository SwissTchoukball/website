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
    >
    </st-person>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import stPerson, { PersonDetail } from '~/components/people/st-person.vue';
import { Gender, Person, Role, RoleWithPartialGroupAndHolders } from '~/plugins/08.cms-service';

export default defineComponent({
  components: { stPerson },
  props: {
    role: {
      type: Object as PropType<Role | RoleWithPartialGroupAndHolders>,
      required: true,
    },
    roleAsSubname: Boolean,
  },
  computed: {
    nameForHolders(): string {
      if (this.role.name_feminine && this.role.holders?.every((holder) => holder.gender === Gender.Female)) {
        return this.role.name_feminine;
      }
      if (this.role.name_masculine && this.role.holders?.every((holder) => holder.gender === Gender.Male)) {
        return this.role.name_masculine;
      }
      return this.role.name;
    },
  },
  methods: {
    getHolderDetails(holder: Person | Partial<Person> | undefined): PersonDetail[] {
      const details = [];
      if (holder?.email) {
        details.push({
          icon: 'envelope',
          text: holder.email,
          href: `mailto:${holder.email}`,
        });
      }
      return details;
    },
  },
});
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
