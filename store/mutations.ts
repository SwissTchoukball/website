import { MutationTree } from 'vuex/types/index';
import { EventTypes, MenuItem, PlayerPositions, RootState } from './state';

export default {
  setMainNavigation(state, mainNavigation: MenuItem[]) {
    state.mainNavigation = mainNavigation;
  },
  setSecondaryNavigation(state, secondaryNavigation: MenuItem[]) {
    state.secondaryNavigation = secondaryNavigation;
  },
  setEventTypes(state, eventTypes: EventTypes) {
    state.eventTypes = eventTypes;
  },
  setPlayerPositions(state, playerPositions: PlayerPositions) {
    state.playerPositions = playerPositions;
  },
  setUpcomingMatchesAsLoaded(state) {
    state.upcomingMatchesLoaded = true;
  },
  setCompetitionEditionAsFullyLoaded(state, { seasonSlug, competitionSlug }) {
    state.fullyLoadedCompetitionEditions.push({ season: seasonSlug, competition: competitionSlug });
  },
} as MutationTree<RootState>;
