import { defineStore } from 'pinia';
import { type DirectusMenuItem, getTranslatedFields } from '~/plugins/06.directus';

export interface MenuItem {
  sort?: number;
  name?: string;
  l10nKey?: string;
  href?: string;
  isExternal?: boolean;
  children?: MenuItem[];
}

export const useNavigationStore = defineStore('navigation', () => {
  const nuxtApp = useNuxtApp();

  const mainNavigation = ref<MenuItem[]>([]);
  const secondaryNavigation = ref<MenuItem[]>([]);
  const footerLinks = ref<MenuItem[]>([]);

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

  const loadMainMenu = async () => {
    const rawMainNavigation = await nuxtApp.$cmsService.getMainNavigation();
    mainNavigation.value = rawMainNavigation.map(transformForStore);
  };

  const loadSecondaryMenu = () => {
    const getSecondaryNavigationl10nKey = (key: string): string => {
      return `footer.secondaryNavigation.${key}`;
    };

    secondaryNavigation.value = [
      {
        l10nKey: getSecondaryNavigationl10nKey('news'),
        href: 'news',
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('photos'),
        href: 'https://flickr.com/swisstchoukball',
        isExternal: true,
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('videos'),
        href: 'https://youtube.com/tchoukballch',
        isExternal: true,
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('shop'),
        href: 'https://shop.tchoukball.ch',
        isExternal: true,
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('contact'),
        href: 'contact',
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('resources'),
        href: 'resources',
      },
      {
        l10nKey: getSecondaryNavigationl10nKey('medias'),
        href: 'medias',
      },
    ];
  };

  const loadFooterLinks = async () => {
    const rawFooterLinks = await nuxtApp.$cmsService.getFooterLinks();
    footerLinks.value = rawFooterLinks.map(transformForStore);
  };

  return {
    mainNavigation,
    secondaryNavigation,
    footerLinks,
    loadMainMenu,
    loadSecondaryMenu,
    loadFooterLinks,
  };
});
