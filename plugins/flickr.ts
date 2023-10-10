import { Plugin } from '@nuxt/types';
import Flickr from 'flickr-sdk';

export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  isprimary: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  url_q?: string;
  height_q: number;
  width_q: number;
  url_m?: string;
  height_m: number;
  width_m: number;
}

export interface FlickrPhotoset {
  id: string;
  owner: string;
  username: string;
  primary: string;
  secret: string;
  server: string;
  farm: number;
  count_views: string;
  count_comments: string;
  count_photos: number;
  count_videos: number;
  title: {
    _content: string;
  };
  description: {
    _content: string;
  };
  can_comment: number;
  date_create: string;
  date_update: string;
  photos: number;
  videos: number;
  visibility_can_see_set: number;
  needs_interstitial: number;
  primary_photo_extras: {
    url_q: string;
    height_q: number;
    width_q: number;
    url_m: string;
    height_m: number;
    width_m: number;
  };
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
