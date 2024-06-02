import { defineStore } from 'pinia';
import { type TranslateResult } from 'vue-i18n';
import { type DirectusMenuItem, getTranslatedFields } from '~/plugins/06.directus';

export interface MenuItem {
  sort?: number;
  name: string | TranslateResult;
  href?: string;
  isExternal?: boolean;
  children?: MenuItem[];
}

export const useNavigationStore = defineStore('navigation', () => {
  const nuxtApp = useNuxtApp();
  const { t } = useI18n();

  const mainNavigation = ref<MenuItem[]>([]);
  const secondaryNavigation = ref<MenuItem[]>([]);

  const loadMainMenu = async () => {
    const rawMainNavigation = await nuxtApp.$cmsService.getMainNavigation();

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

    mainNavigation.value = rawMainNavigation.map(transformForStore);
  };

  const loadSecondaryMenu = () => {
    const getSecondaryNavigationName = (key: string): string => {
      return t(`footer.secondaryNavigation.${key}`).toString();
    };

    secondaryNavigation.value = [
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
  };

  return {
    mainNavigation,
    secondaryNavigation,
    loadMainMenu,
    loadSecondaryMenu,
  };
});
