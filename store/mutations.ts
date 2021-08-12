import { MutationTree } from 'vuex/types/index';
import { EventCategory, MenuItem, RootState } from './state';

export default {
  setMainNavigation(state, mainNavigation: MenuItem[]) {
    state.mainNavigation = mainNavigation;
  },
  setEventCategories(state, eventCategories: EventCategory[]) {
    state.eventCategories = eventCategories;
  },
} as MutationTree<RootState>;
