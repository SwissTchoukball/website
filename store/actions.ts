import { ActionTree } from 'vuex/types/index';
import { ItemInput } from '@directus/sdk';
import { EventTypes, MenuItem, PlayerPositions, RootState } from './state';
import { DirectusMenuItem, getTranslatedFields } from '~/plugins/directus';
import Season from '~/models/season.model';

export default {
  async nuxtServerInit({ dispatch }) {
    await dispatch('loadMainMenu');
    await dispatch('loadSecondaryMenu');
    await dispatch('loadLiveStreams');
    await dispatch('loadSeasons');
    await dispatch('loadDomains');
  },
  async loadMainMenu({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const rawMainNavigation = await this.$directus.items('menus').readByQuery({
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

    const transformForStore = (menuItem: ItemInput<DirectusMenuItem> | undefined): MenuItem => {
      const translatedFields = menuItem ? getTranslatedFields(menuItem) : undefined;

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

    const mainNavigation = rawMainNavigation.data?.map(transformForStore);

    commit('setMainNavigation', mainNavigation);
  },
  loadSecondaryMenu({ commit }) {
    const getSecondaryNavigationName = (key: string): string => {
      return this.$i18n.t(`footer.secondaryNavigation.${key}`).toString();
    };

    // TODO: Eventually move all the data to the CMS
    const secondaryNavigation: MenuItem[] = [
      {
        name: getSecondaryNavigationName('news'),
        href: 'news',
      },
      {
        name: getSecondaryNavigationName('photos'),
        href: 'https://flickr.com/swisstchoukball',
        isExternal: true,
      },
      {
        name: getSecondaryNavigationName('videos'),
        href: 'https://youtube.com/tchoukballch',
        isExternal: true,
      },
      {
        name: getSecondaryNavigationName('shop'),
        href: 'https://shop.tchoukball.ch',
        isExternal: true,
      },
      {
        name: getSecondaryNavigationName('contact'),
        href: 'contact',
      },
      {
        name: getSecondaryNavigationName('resources'),
        href: 'resources',
      },
      {
        name: getSecondaryNavigationName('medias'),
        href: 'medias',
      },
    ];

    commit('setSecondaryNavigation', secondaryNavigation);
  },
  async loadLiveStreams({ commit }) {
    const directusLiveStreams = await this.$cmsService.getLiveStreams();
    commit('setLiveStreams', directusLiveStreams);
  },
  async loadSeasons({ commit }) {
    const directusSeasons = await this.$cmsService.getSeasons();
    commit(
      'setSeasons',
      directusSeasons.map((season) => new Season(season))
    );
  },
  async loadDomains({ commit }) {
    const domains = await this.$cmsService.getDomains();
    commit('setDomains', domains);
  },
  async loadResourceTypes({ commit }) {
    const resourceTypes = await this.$cmsService.getResourceTypes();
    commit('setResourceTypes', resourceTypes);
  },
  async loadEventTypes({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const eventTypes = await this.$directus.items('event_types').readByQuery({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: [
        'id',
        'translations.languages_code',
        'translations.name',
        'translations.name_plural',
        'image.id',
        'image.description',
      ],
    });

    const types = eventTypes.data?.reduce((types, type) => {
      const translatedFields = getTranslatedFields(type);

      if (!type?.id || !translatedFields?.name || !translatedFields?.name_plural) {
        return types;
      }

      return {
        ...types,
        [type.id]: {
          id: type.id,
          name: translatedFields.name,
          name_plural: translatedFields.name_plural,
          image: type.image,
        },
      };
    }, {} as EventTypes);

    commit('setEventTypes', types);
  },
  async loadPlayerPositions({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const playerPositions = await this.$directus.items('player_positions').readByQuery({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: [
        'id',
        'translations.languages_code',
        'translations.name',
        'translations.name_feminine',
        'translations.name_masculine',
      ],
    });

    const positions = playerPositions.data?.reduce((positions, position) => {
      const translatedFields = getTranslatedFields(position);

      if (!position?.id || !translatedFields?.name) {
        return positions;
      }

      return {
        ...positions,
        [position.id]: {
          id: position.id,
          name: translatedFields.name,
          name_feminine: translatedFields.name_feminine,
          name_masculine: translatedFields.name_masculine,
        },
      };
    }, {} as PlayerPositions);

    commit('setPlayerPositions', positions);
  },
} as ActionTree<RootState, RootState>;
