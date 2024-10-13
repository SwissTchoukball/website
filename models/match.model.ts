import type Faceoff from '~/models/faceoff.model';
import type Team from '~/models/team.model';
import { parseLeveradeDate } from '~/utils/utils';
import type {
  LeveradeFacility,
  LeveradeMatch,
  LeveradePeriod,
  LeveradeProfile,
  LeveradeResult,
  LeveradeTeam,
} from '~/plugins/07.leverade';
import type { FaceoffWithoutMatches } from '~/models/faceoff.model';

export interface Facility {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  postal_code: string;
  city: string;
}

export interface Period {
  name?: string;
  order: number;
  home_team_score?: number;
  away_team_score?: number;
}

export interface Referee {
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
}

export default class Match {
  static entity = 'matches';

  id: string;
  datetime: string | null;
  round_id: string;
  faceoff_id: string | null;
  faceoff?: Faceoff | FaceoffWithoutMatches;
  home_team_id: string | null;
  leverade_home_team?: LeveradeTeam;
  home_team?: Team;
  home_team_score?: number | null;
  away_team_id: string | null;
  leverade_away_team?: LeveradeTeam;
  away_team?: Team;
  away_team_score?: number | null;
  periods?: Period[];
  referees?: Referee[];
  facility_id: string | null;
  facility?: Facility | null;
  finished: boolean;
  canceled: boolean;
  rest: boolean;

  // Non-Leverade fields:
  flickr_photoset_id?: string;

  constructor(match: LeveradeMatch) {
    this.id = match.id;
    this.datetime = match.attributes.datetime;
    this.finished = match.attributes.finished;
    this.canceled = match.attributes.canceled;
    this.rest = match.attributes.rest;

    this.home_team_id = match.meta.home_team;
    this.away_team_id = match.meta.away_team;

    this.round_id = match.relationships.round.data.id;
    this.faceoff_id = match.relationships.faceoff.data?.id || null;
    this.facility_id = match.relationships.facility.data?.id || null;
  }

  /**
   * Sets the home and away team instances out of the provided list of teams
   */
  setTeams(teams: Team[]) {
    if (this.home_team_id) {
      this.home_team = teams.find((team) => team.id === this.home_team_id);
    }
    if (this.away_team_id) {
      this.away_team = teams.find((team) => team.id === this.away_team_id);
    }
  }

  setFaceoff(faceoffs: Faceoff[]) {
    if (this.faceoff_id) {
      this.faceoff = faceoffs.find((faceoff) => faceoff.id === this.faceoff_id);
    }
  }

  setResults(results: LeveradeResult[]) {
    const homeResult = results?.find((result) => {
      return (
        result.relationships?.match?.data?.id === this.id &&
        result.relationships?.team?.data?.id === this.home_team_id &&
        result.relationships?.parent?.data?.type === 'match'
      );
    });

    const awayResult = results?.find(
      (result) =>
        result.relationships?.match?.data?.id === this.id &&
        result.relationships?.team?.data?.id === this.away_team_id &&
        result.relationships?.parent?.data?.type === 'match',
    );

    if (homeResult && awayResult) {
      this.home_team_score = homeResult.attributes.value;
      this.away_team_score = awayResult.attributes.value;
    }
  }

  setPeriods(periods: LeveradePeriod[], results: LeveradeResult[]) {
    this.periods = periods
      .filter((period) => period.relationships?.periodable?.data?.id === this.id)
      .map((period) => {
        return {
          name: period.attributes.name,
          order: period.attributes.order,
          home_team_score:
            results?.find(
              (result) =>
                result.relationships?.period?.data?.id === period.id &&
                result.relationships?.team?.data?.id === this.home_team_id,
            )?.attributes.value || undefined,
          away_team_score:
            results?.find(
              (result) =>
                result.relationships?.period?.data?.id === period.id &&
                result.relationships?.team?.data?.id === this.away_team_id,
            )?.attributes.value || undefined,
        };
      })
      .sort((periodA, periodB) => periodA.order - periodB.order);
  }

  setReferees(referees: LeveradeProfile[]) {
    this.referees = referees.map((referee) => {
      return {
        first_name: referee.attributes.first_name,
        last_name: referee.attributes.last_name,
        gender: referee.attributes.gender,
      };
    });
  }

  setFacility(facilities: LeveradeFacility[]) {
    if (this.facility_id) {
      const leveradeFacility = facilities.find((f) => f.id && f.id === this.facility_id);
      if (leveradeFacility) {
        this.facility = {
          id: leveradeFacility.id,
          name: leveradeFacility.attributes.name,
          latitude: leveradeFacility.attributes.latitude,
          longitude: leveradeFacility.attributes.longitude,
          address: leveradeFacility.attributes.address,
          postal_code: leveradeFacility.attributes.postal_code,
          city: leveradeFacility.attributes.city,
        };
      }
    }
  }

  get parsedDate(): Date | undefined {
    if (this.datetime) {
      return parseLeveradeDate(this.datetime);
    }
  }

  get homeTeamName(): string {
    if (this.home_team) {
      return this.home_team.name;
    } else if (this.faceoff?.first_text) {
      return this.faceoff.first_text;
    }
    return '';
  }

  get awayTeamName(): string {
    if (this.away_team) {
      return this.away_team.name;
    } else if (this.faceoff?.second_text) {
      return this.faceoff.second_text;
    }
    return '';
  }

  get hasScore(): boolean {
    return (!!this.home_team_score && this.home_team_score > 0) || (!!this.away_team_score && this.away_team_score > 0);
  }

  get hasHomeTeamWon(): boolean {
    return !!this.home_team_score && !!this.away_team_score && this.home_team_score > this.away_team_score;
  }

  get hasAwayTeamWon(): boolean {
    return !!this.home_team_score && !!this.away_team_score && this.home_team_score < this.away_team_score;
  }

  get mapsUrl(): string | null {
    if (!this.facility) {
      return null;
    }
    // This link will fallback to Google Maps if Apple Maps is not available
    return `//maps.apple.com/?q=${this.facility.address},${this.facility.postal_code}+${this.facility.city}`;
  }

  get hasFacility(): boolean {
    return !!this.facility;
  }

  getSwisstopoMapUrl(locale: string): string | null {
    if (!this.facility) {
      return null;
    }
    const swisssearch = `${this.facility.address}, ${this.facility.postal_code} ${this.facility.city} limit: 1`;
    const bgLayer = 'ch.swisstopo.pixelkarte-farbe';
    return `//map.geo.admin.ch/embed.html?swisssearch=${swisssearch}&lang=${locale}&bgLayer=${bgLayer}&showTooltip=true`;
  }
}
