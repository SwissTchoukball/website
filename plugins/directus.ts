import { Plugin } from '@nuxt/types';
import { Directus, PartialItem } from '@directus/sdk';

export interface DirectusMenuItem {
  parent: number;
  translations: {
    languages_code: string;
    name: string;
    href?: string;
  }[];
  children: DirectusMenuItem[];
}

export interface DirectusPage {
  translations: {
    languages_code: string;
    path: string;
    title: string;
    body: string;
  }[];
}

export interface DirectusNewsCategory {
  id: number;
  news_categories_id: {
    translations: {
      name: string;
      slug: string;
    }[];
  };
}

export interface DirectusNews {
  id: number;
  date_created: string;
  date_updated: string;
  main_image: {
    id: string;
    description: string;
  };
  translations: {
    languages_code: string;
    slug: string;
    title: string;
    body: string;
  }[];
  categories: DirectusNewsCategory[];
}

type CustomTypes = {
  /*
	This type will be merged with Directus user type.
	It's important that the naming matches a directus
	collection name exactly. Typos won't get caught here
	since SDK will assume it's a custom user collection.
	*/
  menus: DirectusMenuItem;
  pages: DirectusPage;
  news: DirectusNews;
};

declare module 'vue/types/vue' {
  // this.$directus inside Vue components
  interface Vue {
    $directus: Directus<CustomTypes>;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$directus inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $directus: Directus<CustomTypes>;
  }
  // nuxtContext.$directus
  interface Context {
    $directus: Directus<CustomTypes>;
  }
}

declare module 'vuex/types/index' {
  // this.$directus inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $directus: Directus<CustomTypes>;
  }
}

const directusPlugin: Plugin = (context, inject) => {
  const directus = new Directus<CustomTypes>(context.$config.cmsURL);

  inject('directus', directus);
};

export default directusPlugin;

export const flattenForLanguage = (
  dataEntry: PartialItem<{ [x: string]: any; translations: { languages_code: string; [y: string]: any }[] }>,
  languageCode: string
) => {
  if (!dataEntry.translations) {
    throw new Error(`No translations`);
  }
  const requestedTranslation = dataEntry.translations.find(
    (translation) => translation?.languages_code && translation.languages_code === languageCode
  );
  if (!requestedTranslation) {
    throw new Error(`No ${languageCode} translation available`);
  }
  const flattenDataEntry: any = {
    ...dataEntry,
    ...requestedTranslation,
  };
  flattenDataEntry.translations = undefined;
  return flattenDataEntry;
};

export const getAssetURL = (cmsURL: string, assetId: string, { width }: { width: number }) => {
  return `${cmsURL}/assets/${assetId}/?width=${width}`;
};

export const getAssetSrcSetEntry = (cmsURL: string, assetId: string, { width }: { width: number }) => {
  return `${getAssetURL(cmsURL, assetId, { width })} ${width}w`;
};

export const getAssetSrcSet = (cmsURL: string, assetId: string, { widths }: { widths: number[] }) => {
  return widths.map((width) => getAssetSrcSetEntry(cmsURL, assetId, { width })).join(',');
};
