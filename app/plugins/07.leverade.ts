import { subMinutes } from 'date-fns';
import type { NitroFetchOptions } from 'nitropack';
export interface LeveradeResponse<T, E = unknown, M = unknown> {
  data: T;
  included?: E[];
  meta: M;
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
    rest: boolean;
  };
  meta: {
    home_team: string | null;
    away_team: string | null;
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
    teams: {
      data: LeveradeBaseEntity[] | null;
    };
    periods: {
      data: LeveradeBaseEntity[] | null;
    };
    results: {
      data: LeveradeBaseEntity[] | null;
    };
    matchreferees: {
      data: LeveradeBaseEntity[] | null;
    };
  };
  // There is more. Only the base and what we need is specified here.
}

export interface LeveradePeriod extends LeveradeEntity {
  type: 'period';
  attributes: {
    finished: boolean;
    name: string;
    order: number;
  };
  relationships: {
    periodable: {
      data: LeveradeBaseEntity;
    };
    results: {
      data: LeveradeBaseEntity[];
    };
  };
}

export interface LeveradeFaceoff extends LeveradeEntity {
  type: 'faceoff';
  attributes: {
    winner: 'first' | 'second' | null;
    first_text: string | null;
    second_text: string | null;
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
    parent: {
      data: LeveradeBaseEntity;
    };
    period: {
      data: LeveradeBaseEntity | null;
    };
  };
}

export interface LeveradeMatchReferee extends LeveradeEntity {
  type: 'matchreferee';
  attributes: {
    attendance: 'confirmed' | 'pending' | 'rejected';
    published: boolean;
  };
  relationships: {
    match: {
      data: LeveradeBaseEntity;
    };
    license: {
      data: LeveradeBaseEntity;
    };
  };
}

export interface LeveradeLicense extends LeveradeEntity {
  type: 'license';
  attributes: {
    type: 'executive' | 'player' | 'referee' | 'staff';
    number: number | null;
  };
  relationships: {
    category: {
      data: LeveradeBaseEntity | null;
    };
    club: {
      data: LeveradeBaseEntity | null;
    };
    form: {
      data: LeveradeBaseEntity;
    };
    profile: {
      data: LeveradeBaseEntity;
    };
    refereecategory?: {
      data: LeveradeBaseEntity;
    };
    season: {
      data: LeveradeBaseEntity | null;
    };
  };
}

export interface LeveradeStandings {
  standingsrows: {
    id: number;
    name: string;
    position: number;
    standingsstats: {
      type: string;
      value: number;
    }[];
  }[];
}

export interface LeveradeProfile extends LeveradeEntity {
  type: 'profile';
  attributes: {
    first_name: string;
    last_name: string;
    gender: 'male' | 'female';
  };
}

export interface Leverade {
  getFullTournament: (
    tournamentId: number | string,
  ) => Promise<
    LeveradeResponse<
      LeveradeTournament,
      LeveradeGroup | LeveradeMatch | LeveradeFaceoff | LeveradeRound | LeveradeTeam | LeveradeFacility | LeveradeResult
    >
  >;
  getStandings: (groupId: number | string) => Promise<LeveradeResponse<unknown, unknown, LeveradeStandings>>;
  getUpcomingMatches: (
    seasonLeveradeId: string,
  ) => Promise<
    LeveradeResponse<
      LeveradeMatch[],
      LeveradeRound | LeveradeGroup | LeveradeTournament | LeveradeTeam | LeveradeFacility
    >
  >;
  getMatch: (
    matchId: number | string,
  ) => Promise<
    LeveradeResponse<
      LeveradeMatch,
      | LeveradeFaceoff
      | LeveradeRound
      | LeveradeGroup
      | LeveradeTournament
      | LeveradeTeam
      | LeveradeResult
      | LeveradePeriod
      | LeveradeMatchReferee
      | LeveradeLicense
      | LeveradeProfile
      | LeveradeFacility
    >
  >;
  getTeams: (tournamentId: number | string) => Promise<LeveradeResponse<LeveradeTeam[]>>;
}

const removeAuthorizationHeaders = (headers: any) => {
  // Removing authorization headers that are somehow added by the production server when this run server-side.
  delete headers.common?.authorization;
  delete headers.authorization;
};

declare module '#app' {
  interface NuxtApp {
    $leverade: Leverade;
  }
}

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();

  const leveradeApi = $fetch.create({
    baseURL: runtimeConfig.public.leveradeURL,
    headers: { 'Accept-Language': nuxtApp.$i18n.locale.value },
    onRequest(context): Promise<void> | void {
      removeAuthorizationHeaders(context.options.headers);
    },
  });

  const cache: Record<string, any> = {};

  const getCachedQuery = async <T = unknown>(
    path: string,
    config?: NitroFetchOptions<string> & { invalidateCache?: boolean },
  ): Promise<T> => {
    if (!config?.invalidateCache && cache[path]) {
      return cache[path];
    }
    const response = await leveradeApi<T>(path, config);
    cache[path] = response;
    return response;
  };

  const getFullTournament: Leverade['getFullTournament'] = (tournamentId) => {
    return getCachedQuery(
      `/tournaments/${tournamentId}?include=groups,groups.rounds,groups.rounds.faceoffs,groups.rounds.matches,groups.rounds.matches.facility,groups.rounds.matches.results,teams`,
    );
  };

  const getStandings: Leverade['getStandings'] = (groupId) => {
    return getCachedQuery(`/groups/${groupId}/standings`);
  };

  const getUpcomingMatches: Leverade['getUpcomingMatches'] = (seasonLeveradeId) => {
    // We remove 90 minutes to account for timezone and to still show the match 30 minutes after it started.
    // FIXME: This would need fine tuning to consider daylight saving time.
    const now = nuxtApp.$formatDate(subMinutes(new Date(), 90), "yyyy-MM-dd'T'HH.mm.ss");
    return getCachedQuery(
      `/matches?filter=datetime>${now},round.group.tournament.season.id:${seasonLeveradeId}&sort=datetime&include=round.group.tournament,teams,facility&page[size]=20`,
    );
  };

  const getMatch: Leverade['getMatch'] = async (matchId) => {
    // We use the endpoint to get a list of matches even though we want only one,
    // because `GET /matches/{id}` is behind authentication
    const matchResponse = await getCachedQuery<
      LeveradeResponse<
        LeveradeMatch[],
        | LeveradeFaceoff
        | LeveradeRound
        | LeveradeGroup
        | LeveradeTournament
        | LeveradeTeam
        | LeveradeResult
        | LeveradePeriod
        | LeveradeMatchReferee
        | LeveradeLicense
        | LeveradeProfile
        | LeveradeFacility
      >
    >(
      `/matches?filter=id:${matchId}&include=round,round.group,round.group.tournament,faceoff,teams,results,periods,matchreferees.license.profile,periods.results,results,facility`,
      // {
      //   transformResponse: (data) => {
      //     const jsonData = JSON.parse(data);
      //     return {
      //       ...jsonData,
      //       data: jsonData.data[0],
      //     };
      //   },
      // },
    );
    return {
      ...matchResponse,
      data: matchResponse.data[0]!,
    };
  };

  const getTeams: Leverade['getTeams'] = (tournamentId) => {
    return getCachedQuery(`/teams?filter=registrable[tournament].id:${tournamentId}&page[size]=500`);
  };

  return {
    provide: {
      leverade: {
        getFullTournament,
        getStandings,
        getUpcomingMatches,
        getMatch,
        getTeams,
      },
    },
  };
});
