<template>
  <st-dynamic-page :title="title" :body="body" />
</template>

<script lang="ts">
import Vue from 'vue';
import { Await } from '~/types/types.utils';
import stDynamicPage from '~/components/st-dynamic-page.vue';

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

    const retrievePage = async (pagePath: string, locale: string) => {
      const pageResponse = await app.$directus.items('pages').readMany({
        filter: { translations: { path: { _eq: pagePath } } },
        fields: ['id', 'translations.languages_code', 'translations.path', 'translations.title', 'translations.body'],
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        deep: { translations: { _filter: { languages_code: { _eq: locale } } } },
        limit: 1,
      });

      if (!pageResponse.data?.length) {
        throw new Error('pageNotFound');
      }

      if (!pageResponse.data[0].translations?.length || !pageResponse.data[0].translations[0]) {
        throw new Error('noData');
      }

      return pageResponse.data[0].translations[0];
    };

    let translatedFields: Await<ReturnType<typeof retrievePage>> = {};

    try {
      translatedFields = await retrievePage(pagePath, i18n.locale);

      if (translatedFields.path !== pagePath) {
        // We are likely in a situation where the page was requested in a specific language,
        // but with the path in another language.
        // This can notably happen when using the language switcher.
        // We just redirect to fix the path.
        redirect(`/${i18n.locale}${translatedFields.path}`);
      }
    } catch (err) {
      switch (err.message) {
        case 'pageNotFound':
          error({ statusCode: 404 });
          break;
        case 'noData':
          console.info('No data in the requested locale. Falling back to default locale.');
          translatedFields = await retrievePage(pagePath, i18n.defaultLocale);
          break;
        default:
          error({ message: `Error when retrieving dynamic page: ${err}` });
      }
    }

    return {
      title: translatedFields.title,
      body: translatedFields.body,
    };
  },
});
</script>
