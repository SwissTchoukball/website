import { Plugin } from '@nuxt/types';
import Flickr from 'flickr-sdk';

export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  url_q?: string;
  url_m?: string;
}

declare module 'vue/types/vue' {
  // this.$flickr inside Vue components
  interface Vue {
    $flickr: any;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$flickr inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $flickr: any;
  }
  // nuxtContext.$flickr
  interface Context {
    $flickr: any;
  }
}

declare module 'vuex/types/index' {
  // this.$flickr inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $flickr: any;
  }
}

const flickrPlugin: Plugin = (context, inject) => {
  const flickr = new Flickr(context.$config.flickr.apiKey);

  inject('flickr', flickr);
};

export default flickrPlugin;
