<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ title }}</h2>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="body"></div>

    <slot name="after-body" />

    <template v-if="resources.length">
      <h3 class="t-headline-2">{{ $t('resources.title') }}</h3>
      <st-resource-list :resources="resources" />
    </template>

    <template v-for="role in keyRoles">
      <st-role v-if="role.holders && role.holders.length > 0" :key="role.id" class="c-simple-page__role" :role="role" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Resource, Role } from '~/plugins/08.cms-service';

defineProps({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    default: '',
  },
  keyRoles: {
    type: Array as PropType<Role[]>,
    default: () => [],
  },
  resources: {
    type: Array as PropType<Resource[]>,
    default: () => [],
  },
});
</script>

<style scoped>
.c-simple-page__role {
  margin-top: var(--st-length-spacing-m);
}
</style>
