<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('structure.title') }}</h2>

    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <st-link-list
      v-else
      :items="groupsNavigation"
      :name="$t('otherNavigation', { name: $t('structure.title') })"
      class="c-structure__group-list"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Group } from '~/plugins/cms-service';
import { MenuItem } from '~/store/state';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/structure',
      de: '/struktur',
    },
  },
  data() {
    return {
      groups: [] as Group[],
    };
  },
  async fetch() {
    this.groups = await this.$cmsService.getGroups();
  },
  head() {
    return {
      title: this.$t('structure.title').toString(),
      meta: [{ property: 'og:title', content: this.$t('structure.title').toString() }],
    };
  },
  computed: {
    groupsNavigation(): MenuItem[] {
      if (!this.groups) {
        return [];
      }

      const groupNaviation = this.groups.map((group) => ({
        name: group.name,
        href: this.localePath({
          name: 'structure-group',
          params: { group: group.slug },
        }),
      }));

      return [
        ...groupNaviation,
        {
          name: this.$t('structure.staff.title').toString(),
          href: this.localePath({
            name: 'structure-group',
            params: { group: this.$t('structure.staff.slug').toString() },
          }),
        },
      ];
    },
  },
});
</script>

<style scoped>
.c-structure__group-list {
  margin-top: var(--st-length-spacing-s);
}
</style>
