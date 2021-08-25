import { ActionTree } from 'vuex/types/index';
import { PartialItem } from '@directus/sdk';
import { isPast, parse } from 'date-fns';
import { EventCategories, MenuItem, PlayerPositions, RootState } from './state';
import { DirectusMenuItem, DirectusNationalCompetition } from '~/plugins/directus';
import CompetitionEdition from '~/models/competition-edition.model';
import Round from '~/models/round.model';
import Match from '~/models/match.model';
import Facility from '~/models/facility.model';
import {
  LeveradeFacility,
  LeveradeGroup,
  LeveradeMatch,
  LeveradeRound,
  LeveradeTeam,
  LeveradeTournament,
} from '~/plugins/leverade';
import Team from '~/models/team.model';
import Phase from '~/models/phase.model';
import Season from '~/models/season.model';

export default {
  async nuxtServerInit({ dispatch }) {
    await dispatch('loadMenu');
    await dispatch('loadSeasons');
  },
  async loadMenu({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const mainNavigation = await this.$directus.items('menus').readMany({
      filter: { parent: { _eq: 1 } },
      sort: ['sort'],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        children: { translations: { _filter: { languages_code: { _eq: locale } } } },
      },
      fields: [
        'translations.languages_code',
        'translations.name',
        'translations.href',
        'children.sort', // The API cannot sort in a relation yet. We do it ourselves.
        'children.translations.languages_code',
        'children.translations.name',
        'children.translations.href',
      ],
    });

    const transformForStore = (menuItem: PartialItem<DirectusMenuItem> | undefined): MenuItem => {
      // Because we requested the menu for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (menuItem && menuItem.translations && menuItem.translations[0]) {
        translatedFields = menuItem.translations[0];
      }

      let children: MenuItem[] = [];
      if (menuItem?.children) {
        children = menuItem.children
          .map(transformForStore)
          // We sort the children because the API can't do it yet (only at the root)
          .sort((childA, childB) => (childA.sort || 0) - (childB.sort || 0));
      }

      return {
        sort: menuItem?.sort || 0,
        name: translatedFields?.name || '',
        href: translatedFields?.href || '',
        children,
      };
    };

    commit('setMainNavigation', mainNavigation.data?.map(transformForStore));
  },
  async loadSeasons() {
    const directusSeasons = await this.$cmsService.getSeasons();
    Season.insert({
      data: directusSeasons,
    });
  },
  async loadEventCategories({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const eventCategories = await this.$directus.items('event_categories').readMany({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: ['id', 'name', 'translations.languages_code', 'translations.name'],
    });

    const categories = eventCategories.data?.reduce((categories, category) => {
      if (!category || !category.id || !category.name) {
        return categories;
      }

      // Because we requested data for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (category.translations && category.translations[0]) {
        translatedFields = category.translations[0];
      }
      return {
        ...categories,
        [category.id]: {
          id: category.id,
          name: translatedFields?.name || category.name,
        },
      };
    }, {} as EventCategories);

    commit('setEventCategories', categories);
  },
  async loadPlayerPositions({ commit }) {
    // TODO: Move logic to CMSService
    const locale = this.app.i18n.locale;

    const playerPositions = await this.$directus.items('player_positions').readMany({
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
      },
      fields: [
        'id',
        'name',
        'name_feminine',
        'name_masculine',
        'translations.languages_code',
        'translations.name',
        'translations.name_feminine',
        'translations.name_masculine',
      ],
    });

    const positions = playerPositions.data?.reduce((positions, position) => {
      if (!position || !position.id || !position.name) {
        return positions;
      }

      // Because we requested data for a specific language, `translations` contain only the language we need
      let translatedFields;
      if (position.translations && position.translations[0]) {
        translatedFields = position.translations[0];
      }
      return {
        ...positions,
        [position.id]: {
          id: position.id,
          name: translatedFields?.name || position.name,
          name_feminine: translatedFields?.name_feminine || position.name_feminine,
          name_masculine: translatedFields?.name_masculine || position.name_masculine,
        },
      };
    }, {} as PlayerPositions);

    commit('setPlayerPositions', positions);
  },

  async insertFacilities(_context, facilities: LeveradeFacility[]) {
    await Facility.insert({
      data: facilities.map((facility) => {
        return {
          id: facility.id,
          name: facility.attributes.name,
          latitude: facility.attributes.latitude,
          longitude: facility.attributes.longitude,
          address: facility.attributes.address,
          postal_code: facility.attributes.postal_code,
          city: facility.attributes.city,
        };
      }),
    });
  },

  async insertMatches(_context, matches: LeveradeMatch[]) {
    await Match.insert({
      data: matches.map((match) => {
        // TODO: Remove when we'll get an actual score
        let home_team_score: number | null = null;
        let away_team_score: number | null = null;
        const matchDate = parse(match.attributes.datetime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isPast(matchDate)) {
          home_team_score = Math.floor(Math.random() * 100);
          away_team_score = Math.floor(Math.random() * 100);
        }

        return {
          id: match.id,
          datetime: match.attributes.datetime,
          home_team_id: match.meta.home_team,
          home_team_score,
          away_team_id: match.meta.away_team,
          away_team_score,
          round_id: match.relationships.round.data.id,
          facility_id: match.relationships.facility.data ? match.relationships.facility.data.id : null,
        };
      }),
    });
  },

  async insertRounds(_context, rounds: LeveradeRound[]) {
    await Round.insert({
      data: rounds.map((round) => {
        return {
          id: round.id,
          name: round.attributes.name,
          start_date: round.attributes.start_date,
          end_date: round.attributes.end_date,
          order: round.attributes.order,
          phase_id: round.relationships.group.data.id,
        };
      }),
    });
  },

  async insertPhases(_context, groups: LeveradeGroup[]) {
    await Phase.insert({
      data: groups.map((group) => {
        return {
          id: group.id,
          name: group.attributes.name,
          type: group.attributes.type,
          group: group.attributes.group,
          competition_edition_id: group.relationships.tournament.data.id,
        };
      }),
    });
  },

  async insertTeams(_context, teams: LeveradeTeam[]) {
    await Team.insert({
      data: teams.map((team) => {
        const avatarKeyMatchArray = team.meta.avatar.large.match(/\/(\w+)\.[0-9]/);

        return {
          id: team.id,
          name: team.attributes.name,
          avatarKey: avatarKeyMatchArray && avatarKeyMatchArray?.length > 1 ? avatarKeyMatchArray[1] : null,
          competition_edition_id: team.relationships.registrable.data.id,
        };
      }),
    });
  },

  async insertCompetitionEditions(
    _context,
    tournaments: (LeveradeTournament & { competition?: DirectusNationalCompetition })[]
  ) {
    // We insertOrUpdate because we don't have the information from Directus and don't want to override it.
    await CompetitionEdition.insertOrUpdate({
      data: tournaments.map((tournament) => {
        const edition: any = {
          leverade_id: tournament.id,
          name: tournament.attributes.name,
          gender: tournament.attributes.gender,
          season_id: tournament.relationships.season.data.id,
        };

        // We do a separate check to not remove the competition_id in case
        // it set in the store and not provided in `tournament`
        if (tournament.competition) {
          edition.competition = tournament.competition;
        }

        return edition;
      }),
    });
  },

  async loadCompetitionEdition(
    context,
    { seasonSlug, competitionSlug }: { seasonSlug: string; competitionSlug: string }
  ) {
    const competitionEditions = await this.$cmsService.getNationalCompetitionEditions({ competitionSlug, seasonSlug });
    if (!competitionEditions || competitionEditions.length < 1) {
      throw new Error('No competition edition found');
    }
    // There should be only one edition matching the request parameters.
    const competitionEdition = competitionEditions[0];
    if (!competitionEdition.leverade_id) {
      throw new Error('This competition edition has no Leverade ID');
    }

    const tournamentResponse = await this.$leverade.getFullTournament(competitionEdition.leverade_id);
    const tournament = tournamentResponse.data.data;

    if (tournamentResponse.data.included) {
      const teams: LeveradeTeam[] = [];
      const groups: LeveradeGroup[] = [];
      const rounds: LeveradeRound[] = [];
      const matches: LeveradeMatch[] = [];
      const facilities: LeveradeFacility[] = [];
      tournamentResponse.data.included.forEach((entity) => {
        switch (entity.type) {
          case 'team':
            teams.push(entity);
            break;
          case 'group':
            groups.push(entity);
            break;
          case 'round':
            rounds.push(entity);
            break;
          case 'match':
            matches.push(entity);
            break;
          case 'facility':
            facilities.push(entity);
            break;
          default:
        }
      });

      await CompetitionEdition.insert({
        data: {
          leverade_id: tournament.id,
          directus_id: competitionEdition.directus_id,
          name: tournament.attributes.name,
          gender: tournament.attributes.gender,
          season: competitionEdition.season,
          competition: competitionEdition.competition,
          teams: teams.map((team) => {
            const avatarKeyMatchArray = team.meta.avatar.large.match(/\/(\w+)\.[0-9]/);

            return {
              id: team.id,
              name: team.attributes.name,
              avatarKey: avatarKeyMatchArray && avatarKeyMatchArray?.length > 1 ? avatarKeyMatchArray[1] : null,
            };
          }),
          phases: groups.map((group) => {
            return {
              id: group.id,
              name: group.attributes.name,
              type: group.attributes.type,
              group: group.attributes.group,
            };
          }),
        },
      });

      await context.dispatch('insertFacilities', facilities);
      await context.dispatch('insertRounds', rounds);
      await context.dispatch('insertMatches', matches);
      context.commit('setCompetitionEditionAsFullyLoaded', { seasonSlug, competitionSlug });
    }
  },

  async loadUpcomingMatches(context) {
    const matchesResponse = await this.$leverade.getUpcomingMatches();
    const matches = matchesResponse.data.data;

    if (!matchesResponse.data.included) {
      throw new Error('Missing included data');
    }

    const teams: LeveradeTeam[] = [];
    const groups: LeveradeGroup[] = [];
    const rounds: LeveradeRound[] = [];
    const tournaments: LeveradeTournament[] = [];
    const facilities: LeveradeFacility[] = [];
    matchesResponse.data.included.forEach((entity) => {
      switch (entity.type) {
        case 'team':
          teams.push(entity);
          break;
        case 'group':
          groups.push(entity);
          break;
        case 'round':
          rounds.push(entity);
          break;
        case 'tournament':
          tournaments.push(entity);
          break;
        case 'facility':
          facilities.push(entity);
          break;
        default:
      }
    });

    // Loading Directus-only data
    const competitionEditions = await this.$cmsService.getNationalCompetitionEditions({
      leveradeIds: tournaments.map((tournament) => tournament.id),
    });

    const tournamentsWithCompetition = tournaments.map((tournament) => {
      const edition = competitionEditions.find((edition) => edition.leverade_id?.toString() === tournament.id);
      if (!edition) {
        return tournament;
      }
      return {
        ...tournament,
        competition: edition.competition,
      };
    });

    await context.dispatch('insertFacilities', facilities);
    await context.dispatch('insertCompetitionEditions', tournamentsWithCompetition);
    await context.dispatch('insertTeams', teams);
    await context.dispatch('insertPhases', groups);
    await context.dispatch('insertRounds', rounds);
    await context.dispatch('insertMatches', matches);
    context.commit('setUpcomingMatchesAsLoaded');
  },
} as ActionTree<RootState, RootState>;
