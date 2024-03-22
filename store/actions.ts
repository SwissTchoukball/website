import { ActionTree } from 'vuex/types/index';
import { MenuItem, RootState } from './state';
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
    const rawMainNavigation = await this.$cmsService.getMainNavigation();

    const transformForStore = (menuItem: DirectusMenuItem | undefined): MenuItem => {
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

    const mainNavigation = rawMainNavigation.map(transformForStore);

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
    const eventTypes = await this.$cmsService.getEventTypes();
    commit('setEventTypes', eventTypes);
  },
  async loadPlayerPositions({ commit }) {
    const playerPositions = await this.$cmsService.getPlayerPositions();
    commit('setPlayerPositions', playerPositions);
  },
} as ActionTree<RootState, RootState>;
