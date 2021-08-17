import { MutationTree } from 'vuex/types/index';
import { EventCategories, MenuItem, PlayerPositions, RootState } from './state';

export default {
  setMainNavigation(state, mainNavigation: MenuItem[]) {
    state.mainNavigation = mainNavigation;
  },
  setEventCategories(state, eventCategories: EventCategories) {
    state.eventCategories = eventCategories;
  },
  setPlayerPositions(state, playerPositions: PlayerPositions) {
    state.playerPositions = playerPositions;
  },
} as MutationTree<RootState>;
