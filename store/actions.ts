import { ActionTree } from 'vuex/types/index';
import { PartialItem } from '@directus/sdk';
import { EventCategories, MenuItem, PlayerPositions, RootState } from './state';
import { DirectusMenuItem } from '~/plugins/directus';

export default {
  async nuxtServerInit({ dispatch }) {
    await dispatch('loadMenu');
  },
  async loadMenu({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const mainNavigation = await this.$directus.items('menus').readMany({
      filter: { parent: { _eq: 1 } },
      sort: ['sort'],
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
        'children.sort', // The API cannot sort in a relation yet. We do it ourselves.
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

      let children: MenuItem[] = [];
      if (menuItem?.children) {
        children = menuItem.children
          .map(transformForStore)
          // We sort the children because the API can't do it yet (only at the root)
          .sort((childA, childB) => (childA.sort || 0) - (childB.sort || 0));
      }

      return {
        sort: menuItem?.sort || 0,
        name: translatedFields?.name || '',
        href: translatedFields?.href || '',
        children,
      };
    };

    commit('setMainNavigation', mainNavigation.data?.map(transformForStore));
  },
  // FIXME: `loadSeasons` is not used anywhere yet. Use it to switch between seasons.
  async loadSeasons({ commit }) {
    const seasons = await this.$cmsService.getSeasons();
    commit('setSeasons', seasons);
  },
  async loadEventCategories({ commit }) {
    // TODO: Move logic to CMSService
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

      // Because we requested data for a specific language, `translations` contain only the language we need
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
  async loadPlayerPositions({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const playerPositions = await this.$directus.items('player_positions').readMany({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: [
        'id',
        'name',
        'name_feminine',
        'name_masculine',
        'translations.languages_code',
        'translations.name',
        'translations.name_feminine',
        'translations.name_masculine',
      ],
    });

    const positions = playerPositions.data?.reduce((positions, position) => {
      if (!position || !position.id || !position.name) {
        return positions;
      }

      // Because we requested data for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (position.translations && position.translations[0]) {
        translatedFields = position.translations[0];
      }
      return {
        ...positions,
        [position.id]: {
          id: position.id,
          name: translatedFields?.name || position.name,
          name_feminine: translatedFields?.name_feminine || position.name_feminine,
          name_masculine: translatedFields?.name_masculine || position.name_masculine,
        },
      };
    }, {} as PlayerPositions);

    commit('setPlayerPositions', positions);
  },
} as ActionTree<RootState, RootState>;
