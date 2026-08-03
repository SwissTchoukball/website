import { defineNuxtPlugin } from '#app';
import _VueMatomo from 'vue-matomo';

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  // vue-matomo is a CJS/UMD bundle. In some bundler configurations
  // (observed with Vite 8 / Nuxt 4.5+) the default export is wrapped
  // in a namespace object. We unwrap it here to guarantee we pass the
  // actual install function to Vue.
  const VueMatomoPlugin =
    typeof _VueMatomo === 'function'
      ? _VueMatomo
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_VueMatomo as any).default || _VueMatomo;

  nuxtApp.vueApp.use(VueMatomoPlugin, {
    host: runtimeConfig.public.matomo.url,
    siteId: runtimeConfig.public.matomo.siteId,
    // Enables automatically registering pageviews on the router
    router: nuxtApp.$router,
    requireConsent: false,
    trackInitialView: true,
    disableCookies: true,
    requireCookieConsent: false,
    enableDebugMode: runtimeConfig.public.matomo.debug,
  });
});
