import { Plugin } from '@nuxt/types';
import { Directus } from '@directus/sdk';

export interface DirectusMenuItem {
  parent: number;
  translations: {
    // eslint-disable-next-line camelcase
    languages_code: string;
    name: string;
    href?: string;
  }[];
  children: DirectusMenuItem[];
}

export interface DirectusPage {
  translations: {
    // eslint-disable-next-line camelcase
    languages_code: string;
    path: string;
    title: string;
    body: string;
  }[];
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
