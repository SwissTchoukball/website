import { Plugin } from '@nuxt/types';

const i18nPlugin: Plugin = ({ app, store }) => {
  // onBeforeLanguageSwitch called right before setting a new locale
  /* app.i18n.onBeforeLanguageSwitch = (oldLocale, newLocale, isInitialSetup, _context) => {
    console.log(oldLocale, newLocale, isInitialSetup);
  }; */
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = async (_oldLocale, _newLocale) => {
    const dataLoads = [store.dispatch('loadMenu')];

    // We load the categories only if we already have them in the old locale
    if (store.state.eventCategories) {
      dataLoads.push(store.dispatch('loadEventCategories'));
    }

    await Promise.all(dataLoads);
  };
};

export default i18nPlugin;
