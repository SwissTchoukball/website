<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-group__breadcrumb" />

    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <h2 class="t-headline-1">{{ groupName }}</h2>

      <p v-if="groupDescription" class="c-group__description l-paragraph">{{ groupDescription }}</p>

      <ul v-if="people" class="u-unstyled-list l-people-list">
        <li v-for="person of people" :key="person.id" class="l-people-list__person">
          <st-staff-person :person="person" :for-group-id="group ? group.id : undefined" />
        </li>
      </ul>
    </template>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import stStaffPerson from '~/components/people/st-staff-person.vue';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import { Group, Person } from '~/plugins/cms-service';

export default defineComponent({
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
      group: undefined as Group | undefined,
      people: [] as Person[],
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

    if (this.groupSlug) {
      this.group = await this.$cmsService.getGroup({ slug: this.groupSlug });
      this.people = await this.$cmsService.getStaff({ groupSlug: this.groupSlug });
    }
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
    groupName(): string {
      return this.group ? this.group.name : this.$t('structure.staff.title').toString();
    },
    groupDescription(): string {
      return this.group ? this.group.description || '' : this.$t('structure.staff.description').toString();
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
