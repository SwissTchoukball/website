<template>
  <div class="c-role">
    <h3 v-if="!roleAsSubname" class="c-role__title t-headline-2">{{ role.nameForHolders }}</h3>
    <st-person
      v-for="holder in role.holders"
      :key="holder.id"
      :name="`${holder.first_name} ${holder.last_name}`"
      :sub-name="roleAsSubname ? role.nameForHolders : null"
      :avatar-asset-id="holder.portrait_square_head"
      :details="getHolderDetails(holder)"
      class="c-role__person"
    >
    </st-person>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import stPerson, { PersonDetail } from '~/components/people/st-person.vue';
import Person from '~/models/person.model';
import Role from '~/models/role.model';

export default Vue.extend({
  components: { stPerson },
  props: {
    role: {
      type: Object as PropType<Role>,
      required: true,
    },
    roleAsSubname: Boolean,
  },
  methods: {
    getHolderDetails(holder: Person): PersonDetail[] {
      const details = [];
      if (holder.email) {
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
