<template>
  <st-dynamic-page :title="title" :body="body" :key-roles="keyRoles" />
</template>

<script lang="ts">
import { Item } from '@vuex-orm/core';
import Vue from 'vue';
import stDynamicPage from '~/components/st-dynamic-page.vue';
import Role from '~/models/role.model';

/**
 * This catch-all page is used to render pages that are fully defined in Directus.
 * Based on the given path, we call the Directus API to get the page content.
 * If there's no match, we redirect to the 404 page.
 */
export default Vue.extend({
  components: { stDynamicPage },
  async asyncData({ app, route, redirect, error, i18n }) {
    const splitPath = route.path.match('^/.{2}(/.*)$');
    let pagePath;
    if (splitPath?.length === 2) {
      pagePath = splitPath[1];
    } else {
      error({ message: 'The given path cannot be processed' });
      return;
    }

    try {
      const page = await app.$cmsService.getPage({ pagePath });

      if (page.path !== pagePath) {
        // We are likely in a situation where the page was requested in a specific language,
        // but with the path in another language.
        // This can notably happen when using the language switcher.
        // We just redirect to fix the path.
        redirect(`/${i18n.locale}${page.path}`);
      }

      return {
        title: page.title,
        body: page.body,
        key_role_ids: page.key_roles,
      };
    } catch (err: any) {
      switch (err.message) {
        case 'pageNotFound':
          error({ statusCode: 404 });
          break;
        case 'noData':
          console.info('No data either in the requested locale or the fallback locale.');
          break;
        default:
          error({ message: `Error when retrieving dynamic page: ${err}` });
      }
    }
  },
  computed: {
    Role() {
      return this.$store.$db().model(Role);
    },
    keyRoles(): Item<Role>[] {
      // We use this as any because key_role_ids comes from asyncData and it is not recognised as being part of the Vue component.
      // This is going to be fixed in Nuxt 2.16.
      // See https://github.com/nuxt/nuxt.js/pull/9239 and https://github.com/nuxt/nuxt.js/pull/9660
      return (this as any).key_role_ids.map((roleId: number) =>
        this.Role.query().with('holders').whereId(roleId).first()
      );
    },
  },
});
</script>
