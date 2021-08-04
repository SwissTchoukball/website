import { ActionTree } from 'vuex/types/index';
import { PartialItem } from '@directus/sdk';
import { MenuItem, RootState } from './state';
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
        // @ts-ignore
        translations: { _filter: { languages_code: { _eq: locale } } },
        // @ts-ignore
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
} as ActionTree<RootState, RootState>;
