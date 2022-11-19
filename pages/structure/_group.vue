<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-group__breadcrumb" />

    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ groupName }}</h2>

      <p v-if="groupDescription" class="c-group__description">{{ groupDescription }}</p>

      <ul v-if="people" class="u-unstyled-list l-people-list">
        <li v-for="person of people" :key="person.id" class="l-people-list__person">
          <st-staff-person :person="person" :for-group-id="group ? group.id : undefined" />
        </li>
      </ul>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collection } from '@vuex-orm/core';

import stStaffPerson from '~/components/people/st-staff-person.vue';
import Group from '~/models/group.model';
import Person from '~/models/person.model';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/structure/:group',
      de: '/struktur/:group',
    },
  },
  components: { stStaffPerson },
  data() {
    return {
      groupSlug: null as string | null,
      breadcrumb: [
        {
          pageName: 'structure',
          displayName: this.$t('structure.title').toString(),
        },
      ] as BreadcrumbItem[],
    };
  },
  async fetch() {
    // If we ask for the staff, we want everyone, and don't set the groupSlug
    if (this.$route.params?.group !== this.$t('structure.staff.slug')) {
      this.groupSlug = this.$route.params?.group;
    }

    await this.$store.dispatch('loadStaff', { groupSlug: this.groupSlug });
  },
  head() {
    return {
      title: (this as any).groupName,
      meta: [
        { property: 'og:title', content: (this as any).groupName },
        {
          hid: 'og:description',
          property: 'og:description',
          content: (this as any).groupDescription,
        },
      ],
    };
  },
  computed: {
    Group() {
      return this.$store.$db().model(Group);
    },
    group(): Group | null {
      if (!this.groupSlug) {
        return null;
      }
      return this.Group.query().where('slug', this.groupSlug).with('roles').with('roles.holders').first();
    },
    groupName(): string {
      return this.group ? this.group.name : this.$t('structure.staff.title').toString();
    },
    groupDescription(): string {
      return this.group ? this.group.description : this.$t('structure.staff.description').toString();
    },
    Person() {
      return this.$store.$db().model(Person);
    },
    people(): Collection<Person> {
      let personQuery = this.Person.query().with('roles').with('roles.group');

      if (this.group) {
        personQuery = personQuery.whereHas('roles', (query) => {
          query.where('group_id', this.group?.id);
        });
      } else {
        // If no group is set, it means we show everyone.
        // However, we don't want to show people that have no roles.
        personQuery = personQuery.whereHas('roles', (query) => {
          return query.count() > 0;
        });
      }

      personQuery = personQuery.orderBy('last_name');

      return personQuery.get();
    },
  },
});
</script>

<style scoped>
.c-group__breadcrumb {
  margin-top: var(--st-length-spacing-s);
}

.c-group__description {
  margin-top: var(--st-length-spacing-s);
}
</style>
