import { Plugin } from '@nuxt/types';

const i18nPlugin: Plugin = ({ app, store }) => {
  // onBeforeLanguageSwitch called right before setting a new locale
  /* app.i18n.onBeforeLanguageSwitch = (oldLocale, newLocale, isInitialSetup, _context) => {
    console.log(oldLocale, newLocale, isInitialSetup);
  }; */
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = (_oldLocale, _newLocale) => {
    store.dispatch('loadMenu');
  };
};

export default i18nPlugin;
