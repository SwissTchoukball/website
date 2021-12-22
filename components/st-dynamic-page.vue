<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ title }}</h2>
    <!-- We have to use v-html here as we get html content directly from Directus -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="directus-formatted-content" v-html="body"></div>

    <template v-if="resources.length">
      <h3 class="t-headline-2">{{ $t('resources.title') }}</h3>
      <st-resource-list :resources="resources" />
    </template>

    <template v-for="role in keyRoles">
      <st-role v-if="role.holders.length > 0" :key="role.id" :role="role" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Role from '~/models/role.model';
import Resource from '~/models/resource.model';
import stRole from '~/components/people/st-role.vue';
import StResourceList from '~/components/resources/st-resource-list.vue';

export default Vue.extend({
  components: { stRole, StResourceList },
  props: {
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
  },
});
</script>

<style scoped>
.c-dynamic-page__body {
  margin-top: var(--st-length-spacing-s);
}
</style>
