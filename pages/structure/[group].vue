<template>
  <section class="l-main-content-section">
    <st-breadcrumb :items="breadcrumb" class="c-group__breadcrumb" />

    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">{{ $t('error.otherError') }} : {{ fetchError.message }}</p>
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

<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import type { Group, Person } from '~/plugins/08.cms-service';

const route = useRoute();
const { t } = useI18n();
const { $cmsService } = useNuxtApp();

defineI18nRoute({
  paths: {
    fr: '/structure/[group]',
    de: '/struktur/[group]',
  },
});

const groupSlug = ref<string>();
const group = ref<Group>();
const people = ref<Person[]>([]);
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    pageName: 'structure',
    displayName: t('structure.title').toString(),
  },
]);

useHead(() => {
  return {
    title: groupName.value,
    meta: [
      { property: 'og:title', content: groupName.value },
      {
        hid: 'og:description',
        property: 'og:description',
        content: groupDescription.value,
      },
    ],
  };
});

const groupName = computed<string>(() => {
  return group.value ? group.value.name : t('structure.staff.title').toString();
});
const groupDescription = computed<string>(() => {
  return group.value ? group.value.description || '' : t('structure.staff.description').toString();
});

const { pending: fetchPending, error: fetchError } = useAsyncData('group', async () => {
  // If we ask for the staff, we want everyone, and don't set the groupSlug
  if (route.params?.group !== t('structure.staff.slug') && !Array.isArray(route.params?.group)) {
    groupSlug.value = route.params?.group;
  }

  if (groupSlug.value) {
    group.value = await $cmsService.getGroup({ slug: groupSlug.value });
  }

  people.value = await $cmsService.getStaff({ groupSlug: groupSlug.value });
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
