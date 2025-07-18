import { createFlickr, type Flickr } from 'flickr-sdk';

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

declare module '#app' {
  interface NuxtApp {
    $flickr: Flickr;
  }
}

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();

  const { flickr } = createFlickr(runtimeConfig.public.flickr.apiKey);

  return {
    provide: {
      flickr,
    },
  };
});
