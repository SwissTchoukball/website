import { ActionTree } from 'vuex/types/index';
import { PartialItem } from '@directus/sdk';
import { EventCategories, MenuItem, RootState } from './state';
import { DirectusMenuItem } from '~/plugins/directus';

export default {
  async nuxtServerInit({ dispatch }) {
    await dispatch('loadMenu');
  },
  async loadMenu({ commit }) {
    const locale = this.app.i18n.locale;

    const mainNavigation = await this.$directus.items('menus').readMany({
      filter: { parent: { _eq: 1 } },
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        children: { translations: { _filter: { languages_code: { _eq: locale } } } },
      },
      fields: [
        'translations.languages_code',
        'translations.name',
        'translations.href',
        'children.translations.languages_code',
        'children.translations.name',
        'children.translations.href',
      ],
    });

    const transformForStore = (menuItem: PartialItem<DirectusMenuItem> | undefined): MenuItem => {
      // Because we requested the menu for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (menuItem && menuItem.translations && menuItem.translations[0]) {
        translatedFields = menuItem.translations[0];
      }
      return {
        name: translatedFields?.name || '',
        href: translatedFields?.href || '',
        children: menuItem?.children?.map(transformForStore) || [],
      };
    };

    commit('setMainNavigation', mainNavigation.data?.map(transformForStore));
  },
  async loadEventCategories({ commit }) {
    const locale = this.app.i18n.locale;

    const eventCategories = await this.$directus.items('event_categories').readMany({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: ['id', 'name', 'translations.languages_code', 'translations.name'],
    });

    const categories = eventCategories.data?.reduce((categories, category) => {
      if (!category || !category.id || !category.name) {
        return categories;
      }

      // Because we requested the menu for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (category.translations && category.translations[0]) {
        translatedFields = category.translations[0];
      }
      return {
        ...categories,
        [category.id]: {
          id: category.id,
          name: translatedFields?.name || category.name,
        },
      };
    }, {} as EventCategories);

    commit('setEventCategories', categories);
  },
} as ActionTree<RootState, RootState>;
