import { Plugin } from '@nuxt/types';
import { format } from 'date-fns';
import { fr, de } from 'date-fns/locale';

type FormatDate = (date: number | Date, formatStr: string) => string;

declare module 'vue/types/vue' {
  // this.$formatDate inside Vue components
  interface Vue {
    $formatDate: FormatDate;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$formatDate inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $formatDate: FormatDate;
  }
  // nuxtContext.$formatDate
  interface Context {
    $formatDate: FormatDate;
  }
}

declare module 'vuex/types/index' {
  // this.$formatDate inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $formatDate: FormatDate;
  }
}

const locales: { [key: string]: Locale } = { fr, de };

/**
 * Plugin providing a single function to format a date according to the locale set in context
 */
const formatDatePlugin: Plugin = (context, inject) => {
  const formatDate = (date: number | Date, formatStr = 'PP') => {
    return format(date, formatStr, {
      locale: locales[context.i18n.locale],
    });
  };

  inject('formatDate', formatDate);
};

export default formatDatePlugin;
