import { format, formatDistanceToNow, type Locale } from 'date-fns';
import { fr, de } from 'date-fns/locale';

const locales: { [key: string]: Locale } = { fr, de };

interface FormatDateServices {
  formatDate: (date: number | Date, formatStr?: string) => string;
  formatDateDistanceToNow: (date: number | Date) => string;
}

declare module '#app' {
  interface NuxtApp {
    $formatDate: FormatDateServices['formatDate'];
    $formatDistanceToNow: FormatDateServices['formatDateDistanceToNow'];
  }
}

/**
 * Plugin providing a single function to format a date according to the locale set in context
 */
export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp();

  const formatDate: FormatDateServices['formatDate'] = (date, formatStr = 'PP') => {
    return format(date, formatStr, {
      locale: locales[nuxtApp.$i18n.locale.value],
    });
  };

  const formatDateDistanceToNow: FormatDateServices['formatDateDistanceToNow'] = (date) => {
    return formatDistanceToNow(date, {
      locale: locales[nuxtApp.$i18n.locale.value],
      addSuffix: true,
    });
  };

  return {
    provide: {
      formatDate,
      formatDateDistanceToNow,
    },
  };
});
