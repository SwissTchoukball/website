import { defineNuxtPlugin } from '#app';
import VueMatomo from 'vue-matomo';

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  nuxtApp.vueApp.use(VueMatomo, {
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
