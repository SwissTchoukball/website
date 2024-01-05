import { GetterTree } from 'vuex/types/index';
import { RootState } from '~/store/state';
import Season from '~/models/season.model';
import { DirectusSeason } from '~/plugins/directus';
import { Domain } from '~/plugins/cms-service';

export default {
  findSeason:
    (state) =>
    (predicate: (value: DirectusSeason, index: number, obj: DirectusSeason[]) => unknown): Season | undefined => {
      const rawSeason = state.seasons.find(predicate);
      if (!rawSeason) {
        return;
      }
      return new Season(rawSeason);
    },

  currentSeason: (_state, getters): Season | undefined => {
    const today = new Date().toISOString().substring(0, 10);
    return getters.findSeason((season: DirectusSeason) => season.date_start <= today && season.date_end >= today);
  },
  getSeasonBySlug:
    (_state, getters) =>
    (slug: string): Season | undefined => {
      return getters.findSeason((season: DirectusSeason) => season.slug === slug);
    },
  getSeasonByLeveradeId:
    (_state, getters) =>
    (leveradeId: string): Season | undefined => {
      return getters.findSeason(
        (season: DirectusSeason) => season.leverade_id && season.leverade_id.toString() === leveradeId
      );
    },
  getDomainById:
    (state) =>
    (id: number): Domain | undefined => {
      return state.domains.find((domain: Domain) => domain.id === id);
    },
} as GetterTree<RootState, RootState>;
