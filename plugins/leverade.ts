import { Plugin } from '@nuxt/types';

export interface LeveradeResponse<T> {
  data: {
    data: T;
  };
}

export interface LeveradeTournament {
  type: string;
  id: string;
  attributes: {
    name: string;
    gender: string;
  };
  // There is more. Only the base and what we need is specified here.
}

export interface LeveradeGroup {
  type: string;
  id: string;
  attributes: {
    name: string;
    type: string;
    group: string | null;
  };
  // There is more. Only the base and what we need is specified here.
}

interface Leverade {
  // getTournaments: (seasonId: number | string) => Promise<any>;
  getTournament: (tournamentId: number | string) => Promise<LeveradeResponse<LeveradeTournament>>;
  getGroups: (tournamentId: number | string) => Promise<LeveradeResponse<LeveradeGroup[]>>;
  getStandings: (groupId: number | string) => Promise<any>;
}

const leveradePlugin: Plugin = ({ $config, $axios }, inject) => {
  // const getTournaments: Leverade['getTournaments'] = (seasonId) => {
  //   return $axios.get(`${$config.leveradeURL}/tournaments/?filter=season.id:${seasonId}`);
  // };
  const getTournament: Leverade['getTournament'] = (tournamentId) => {
    return $axios.get(`${$config.leveradeURL}/tournaments/${tournamentId}`);
  };

  const getGroups: Leverade['getGroups'] = (tournamentId) => {
    return $axios.get(`${$config.leveradeURL}/groups?filter=tournament.id:${tournamentId}`);
  };

  const getStandings: Leverade['getStandings'] = (groupId) => {
    return $axios.get(`${$config.leveradeURL}/groups/${groupId}/standings`);
  };

  inject('leverade', {
    // getTournaments,
    getTournament,
    getGroups,
    getStandings,
  });
};

export default leveradePlugin;

declare module 'vue/types/vue' {
  // this.$leverade inside Vue components
  interface Vue {
    $leverade: Leverade;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$leverade inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $leverade: Leverade;
  }
  // nuxtContext.$leverade
  interface Context {
    $leverade: Leverade;
  }
}

declare module 'vuex/types/index' {
  // this.$leverade inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $leverade: Leverade;
  }
}
