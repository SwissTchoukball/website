import { MutationTree } from 'vuex/types/index';
import { EventTypes, MenuItem, PlayerPositions, RootState } from './state';
import { Domain, LiveStream, ResourceType } from '~/plugins/cms-service';
import { DirectusSeason } from '~/plugins/directus';

export default {
  setMainNavigation(state, mainNavigation: MenuItem[]) {
    state.mainNavigation = mainNavigation;
  },
  setSecondaryNavigation(state, secondaryNavigation: MenuItem[]) {
    state.secondaryNavigation = secondaryNavigation;
  },
  setDomains(state, domains: Domain[]) {
    state.domains = domains;
  },
  setSeasons(state, seasons: DirectusSeason[]) {
    state.seasons = seasons;
  },
  setResourceTypes(state, resourceTypes: ResourceType[]) {
    state.resourceTypes = resourceTypes;
  },
  setEventTypes(state, eventTypes: EventTypes) {
    state.eventTypes = eventTypes;
  },
  setPlayerPositions(state, playerPositions: PlayerPositions) {
    state.playerPositions = playerPositions;
  },
  setLiveStreams(state, liveStreams: LiveStream[]) {
    state.liveStreams = liveStreams;
  },
  setUpcomingMatchesAsLoaded(state) {
    state.upcomingMatchesLoaded = true;
  },
  setCompetitionEditionAsFullyLoaded(state, { seasonSlug, competitionSlug }) {
    state.fullyLoadedCompetitionEditions.push({ season: seasonSlug, competition: competitionSlug });
  },
} as MutationTree<RootState>;
