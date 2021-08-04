import { MutationTree } from 'vuex/types/index';
import { MenuItem, RootState } from './state';

export default {
  setMainNavigation(state, mainNavigation: MenuItem[]) {
    state.mainNavigation = mainNavigation;
  },
} as MutationTree<RootState>;
