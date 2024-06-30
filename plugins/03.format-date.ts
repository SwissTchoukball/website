import { format, formatDistanceToNow, type Locale } from 'date-fns';
import { fr, de } from 'date-fns/locale';

const locales: { [key: string]: Locale } = { fr, de };

/**
 * Plugin providing a single function to format a date according to the locale set in context
 */
export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp();

  const formatDate = (date: number | Date, formatStr = 'PP') => {
    return format(date, formatStr, {
      locale: locales[nuxtApp.$i18n.locale.value],
    });
  };

  const formatDateDistanceToNow = (date: number | Date) => {
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
