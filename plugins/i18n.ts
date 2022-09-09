import { Plugin } from '@nuxt/types';
import ResourceType from '~/models/resource-type.model';

const i18nPlugin: Plugin = ({ app, store }) => {
  // onBeforeLanguageSwitch called right before setting a new locale
  /* app.i18n.onBeforeLanguageSwitch = (oldLocale, newLocale, isInitialSetup, _context) => {
    console.log(oldLocale, newLocale, isInitialSetup);
  }; */
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = async (_oldLocale, _newLocale) => {
    const dataLoads = [
      store.dispatch('loadMainMenu'),
      store.dispatch('loadSecondaryMenu'),
      store.dispatch('loadDomains'),
    ];

    // We load the event types only if we already have them in the old locale
    if (store.state.eventTypes) {
      dataLoads.push(store.dispatch('loadEventTypes'));
    }

    // We load the positions only if we already have them in the old locale
    if (store.state.playerPositions) {
      dataLoads.push(store.dispatch('loadPlayerPositions'));
    }

    // We load the resource types only if we already have them in the old locale
    if (store.$db().model(ResourceType).exists()) {
      dataLoads.push(store.dispatch('loadResourceTypes'));
    }

    await Promise.all(dataLoads);
  };
};

export default i18nPlugin;
