<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('staff.title') }}</h2>
    <select v-model="groupId" name="groupId" class="l-form-select c-staff__group-select" @change="switchGroup">
      <option value="all">{{ $t('staff.all') }}</option>
      <option v-for="group of groups" :key="group.id" :value="group.id">{{ group.name }}</option>
    </select>
    <p v-if="selectedGroup && selectedGroup.description" class="c-staff__group-description">
      {{ selectedGroup.description }}
    </p>
    <ul v-if="people" class="u-unstyled-list l-people-list">
      <li v-for="person of people" :key="person.id" class="l-people-list__person">
        <st-staff-person :person="person" :for-group-id="selectedGroup ? selectedGroup.id : undefined" />
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { Collection, Item } from '@vuex-orm/core';
import Vue from 'vue';
import stStaffPerson from '~/components/people/st-staff-person.vue';
import Group from '~/models/group.model';
import Person from '~/models/person.model';
import { isDigits } from '~/utils/utils';

const ALL_OPTION = 'all';

export default Vue.extend({
  components: { stStaffPerson },
  nuxtI18n: {
    paths: {
      fr: '/federation/staff',
      de: '/verband/staff',
    },
  },
  data() {
    return {
      groupId: ALL_OPTION as number | typeof ALL_OPTION,
    };
  },
  async fetch() {
    // We load the groups only if we don't have them already
    if (!this.Group.exists()) {
      await this.$store.dispatch('loadGroups');
    }

    if (typeof this.$route.query.groupId === 'string' && isDigits(this.$route.query.groupId)) {
      this.groupId = parseInt(this.$route.query.groupId);
    }
    await this.$store.dispatch('loadStaff', { groupId: this.groupId !== ALL_OPTION ? this.groupId : undefined });
  },
  computed: {
    Person() {
      return this.$store.$db().model(Person);
    },
    Group() {
      return this.$store.$db().model(Group);
    },
    people(): Collection<Person> {
      let personQuery = this.Person.query().with('roles', (query) => {
        query.with('group').orderBy((role: any) => role.group_id);
      });

      if (this.groupId !== ALL_OPTION) {
        personQuery = personQuery.whereHas('roles', (query) => {
          query.where('group_id', this.groupId);
        });
      }

      personQuery = personQuery.orderBy('first_name');

      return personQuery.get();
    },
    groups(): Collection<Group> {
      return this.Group.all();
    },
    selectedGroup(): Item<Group> {
      return this.groupId !== ALL_OPTION ? this.Group.find(this.groupId) : null;
    },
  },
  watch: {
    '$route.query.groupId': '$fetch',
  },
  methods: {
    switchGroup() {
      let queryGroupId: string | undefined = this.groupId.toString();
      if (queryGroupId === ALL_OPTION) {
        queryGroupId = undefined;
      }
      this.$router.push({ query: { groupId: queryGroupId } });
    },
  },
});
</script>

<style scoped>
.c-staff__group-select {
  margin-top: var(--st-length-spacing-xs);
}

.c-staff__group-description {
  margin-top: var(--st-length-spacing-s);
}
</style>
