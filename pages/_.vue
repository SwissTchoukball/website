<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import { Item } from '@vuex-orm/core';
import { decode } from 'html-entities';
import stSimplePage from '~/components/st-simple-page.vue';
import Resource from '~/models/resource.model';
import Role from '~/models/role.model';

/**
 * This catch-all page is used to render pages that are fully defined in Directus.
 * Based on the given path, we call the Directus API to get the page content.
 * If there's no match, we redirect to the 404 page.
 */
export default Vue.extend({
  components: { stSimplePage },
  async asyncData({ app, route, redirect, error, i18n }) {
    let splitPath = route.path.match('^/.{2}(/.*)$');
    if (!splitPath) {
      // This means there's no match, and thus no language prefix. This can happen with the default language.
      splitPath = [route.path, route.path];
    }
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
        resource_ids: page.resources,
      };
    } catch (err: any) {
      switch (err.message) {
        case 'pageNotFound':
          error({ statusCode: 404, message: `Could not find page for ${pagePath}` });
          break;
        case 'noData':
          console.info('No data either in the requested locale or the fallback locale.');
          break;
        default:
          error({ message: `Error when retrieving simple page: ${err}` });
      }
    }
  },
  head(): MetaInfo {
    // We use this as any because body comes from asyncData and it is not recognised as being part of the Vue component.
    // This is going to be fixed in Nuxt 2.16.
    // See https://github.com/nuxt/nuxt.js/pull/9239 and https://github.com/nuxt/nuxt.js/pull/9660
    const body = (this as any).body || '';
    return {
      title: (this as any).title,
      meta: [
        { property: 'og:title', content: (this as any).title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: decode(body.replace(/(<([^>]+)>)/gi, '').substr(0, 250)) + '…',
        },
      ],
    };
  },
  computed: {
    Role() {
      return this.$store.$db().model(Role);
    },
    Resource() {
      return this.$store.$db().model(Resource);
    },
    keyRoles(): Item<Role>[] {
      // We use this as any because key_role_ids comes from asyncData and it is not recognised as being part of the Vue component.
      // This is going to be fixed in Nuxt 2.16.
      // See https://github.com/nuxt/nuxt.js/pull/9239 and https://github.com/nuxt/nuxt.js/pull/9660
      const key_role_ids = (this as any).key_role_ids;
      if (!key_role_ids) {
        return [];
      }
      return key_role_ids.map((roleId: number) => this.Role.query().with('holders').whereId(roleId).first());
    },
    resources(): Item<Resource>[] {
      // We use this as any because resource_ids comes from asyncData and it is not recognised as being part of the Vue component.
      // This is going to be fixed in Nuxt 2.16.
      // See https://github.com/nuxt/nuxt.js/pull/9239 and https://github.com/nuxt/nuxt.js/pull/9660
      const resource_ids = (this as any).resource_ids;
      if (!resource_ids) {
        return [];
      }
      return resource_ids.map((resourceId: number) => this.Resource.query().whereId(resourceId).first());
    },
  },
});
</script>
