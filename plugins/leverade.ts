import { Plugin } from '@nuxt/types';

export interface LeveradeResponse<T, E = {}> {
  data: {
    data: T;
    included?: E[];
  };
}

export interface LeveradeBaseEntity {
  type: string;
  id: string;
}

export interface LeveradeEntity extends LeveradeBaseEntity {
  type: string;
  id: string;
  attributes: {
    [key: string]: any;
  };
  meta: {
    [key: string]: any;
  };
  relationships: {
    [key: string]: { data: LeveradeBaseEntity | LeveradeBaseEntity[] | null };
  };
}

export interface LeveradeTournament extends LeveradeEntity {
  type: 'tournament';
  attributes: {
    name: string;
    gender: string;
  };
  relationships: {
    season: {
      data: LeveradeBaseEntity;
    };
  };
  // There is more. Only the base and what we need is specified here.
}

export enum LeveradeGroupType {
  LEAGUE = 'league',
  PLAY_OFF = 'play_off',
}

export interface LeveradeGroup extends LeveradeEntity {
  type: 'group';
  attributes: {
    name: string;
    order: number;
    type: LeveradeGroupType;
    group: string | null;
  };
  relationships: {
    tournament: {
      data: LeveradeBaseEntity;
    };
  };
  // There is more. Only the base and what we need is specified here.
}

export interface LeveradeMatch extends LeveradeEntity {
  type: 'match';
  attributes: {
    datetime: string;
    finished: boolean;
    canceled: boolean;
  };
  meta: {
    home_team: string;
    away_team: string;
  };
  relationships: {
    round: {
      data: LeveradeBaseEntity;
    };
    facility: {
      data: LeveradeBaseEntity | null;
    };
    faceoff: {
      data: LeveradeBaseEntity | null;
    };
  };
  // There is more. Only the base and what we need is specified here.
}

export interface LeveradeFaceoff extends LeveradeEntity {
  type: 'faceoff';
  attributes: {
    winner: 'first' | 'second' | null;
  };
  relationships: {
    first_team: {
      data: LeveradeBaseEntity | null;
    };
    second_team: {
      data: LeveradeBaseEntity | null;
    };
    round: {
      data: LeveradeBaseEntity;
    };
    matches: {
      data: LeveradeBaseEntity[];
    };
  };
}

export interface LeveradeRound extends LeveradeEntity {
  type: 'round';
  attributes: {
    name: string;
    start_date: string;
    end_date: string;
    order: number;
  };
  relationships: {
    group: {
      data: LeveradeBaseEntity;
    };
  };
}

export interface LeveradeTeam extends LeveradeEntity {
  type: 'team';
  attributes: {
    name: string;
  };
  meta: {
    avatar: {
      large: string;
    };
  };
  relationships: {
    registrable: {
      data: LeveradeBaseEntity;
    };
  };
}

export interface LeveradeFacility extends LeveradeEntity {
  type: 'facility';
  attributes: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    postal_code: string;
    city: string;
  };
}

export interface LeveradeResult extends LeveradeEntity {
  type: 'result';
  attributes: {
    value: number | null;
    score: number | null;
  };
  relationships: {
    match: {
      data: LeveradeBaseEntity;
    };
    team: {
      data: LeveradeBaseEntity;
    };
  };
}

interface Leverade {
  getFullTournament: (
    tournamentId: number | string
  ) => Promise<
    LeveradeResponse<
      LeveradeTournament,
      LeveradeGroup | LeveradeMatch | LeveradeFaceoff | LeveradeRound | LeveradeTeam | LeveradeFacility | LeveradeResult
    >
  >;
  getStandings: (groupId: number | string) => Promise<any>;
  getUpcomingMatches: (
    seasonLeveradeId: string
  ) => Promise<
    LeveradeResponse<
      LeveradeMatch[],
      LeveradeRound | LeveradeGroup | LeveradeTournament | LeveradeTeam | LeveradeFacility
    >
  >;
}

const leveradePlugin: Plugin = ({ $config, $axios, $formatDate }, inject) => {
  const getFullTournament: Leverade['getFullTournament'] = (tournamentId) => {
    return $axios.get(
      `${$config.leveradeURL}/tournaments/${tournamentId}?include=groups,groups.rounds,groups.rounds.faceoffs,groups.rounds.matches,groups.rounds.matches.facility,groups.rounds.matches.results,teams`,
      {
        transformRequest: (data, headers) => {
          // Removing authorization headers that are somehow added by the production server when this run server-side.
          delete headers.common.authorization;
          delete headers.authorization;
          return data;
        },
      }
    );
  };

  const getStandings: Leverade['getStandings'] = (groupId) => {
    return $axios.get(`${$config.leveradeURL}/groups/${groupId}/standings`, {
      transformRequest: (data, headers) => {
        // Removing authorization headers that are somehow added by the production server when this run server-side.
        delete headers.common.authorization;
        delete headers.authorization;
        return data;
      },
    });
  };

  const getUpcomingMatches: Leverade['getUpcomingMatches'] = (seasonLeveradeId) => {
    const today = $formatDate(new Date(), 'yyyy-MM-dd');
    return $axios.get(
      `${$config.leveradeURL}/matches?filter=datetime>${today},round.group.tournament.season.id:${seasonLeveradeId}&sort=datetime&include=round.group.tournament,teams,facility`,
      {
        transformRequest: (data, headers) => {
          // Removing authorization headers that are somehow added by the production server when this run server-side.
          delete headers.common.authorization;
          delete headers.authorization;
          return data;
        },
      }
    );
  };

  inject('leverade', {
    getFullTournament,
    getStandings,
    getUpcomingMatches,
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
