import { Plugin } from '@nuxt/types';
import { set } from 'date-fns';
import { aggregate, readItem, readItems, type DirectusFile, type Query } from '@directus/sdk';
import { Await } from '~/types/types.utils';
import {
  DirectusClub,
  DirectusDomain,
  DirectusEvent,
  DirectusEventType,
  DirectusGroup,
  DirectusLiveStream,
  DirectusMatchAdditionalData,
  DirectusMenuItem,
  DirectusNationalCompetition,
  DirectusNationalCompetitionEdition,
  DirectusNationalTeamCompetition,
  DirectusNationalTeamCompetitionUpdate,
  DirectusNationalTeamCompetitionsTeam,
  DirectusNews,
  DirectusPage,
  DirectusPerson,
  DirectusPlayerPosition,
  DirectusPressRelease,
  DirectusResource,
  DirectusResourceStatus,
  DirectusResourceType,
  DirectusRole,
  DirectusSchema,
  DirectusSeason,
  DirectusTchoukup,
  DirectusTeam,
  DirectusText,
  getTranslatedFields,
} from '~/plugins/directus';
import { NewsEntry } from '~/components/news/st-news';
import { Tchoukup } from '~/components/tchoukup/st-tchoukup';
import {
  NationalTeam,
  NationalTeamCompetition,
  NationalTeamCompetitionUpdate,
  NationalTeamForCompetition,
  NationalTeamResult,
} from '~/components/national-teams/st-national-teams.prop';
import { processRawCoaches, processRawPlayers } from '~/plugins/cms-service/national-teams';
import { PressRelease } from '~/components/press-releases/press-releases';
import { toISOLocal } from '~/utils/utils';
import { EventTypes, PlayerPositions } from '~/store/state';

export interface ResourceType {
  id: number;
  name?: string;
}

export interface Resource {
  id: number;
  name: string;
  file?: DirectusFile<DirectusSchema>;
  link?: string;
  type: ResourceType;
  domain_ids: number[];
  date: string;
  status: DirectusResourceStatus;
}

export interface TextEntry {
  id: number;
  body: string;
}

export interface Domain {
  id: number;
  name: string;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  portrait_square_head?: string;
  gender: Gender;
  email?: string;
  // eslint-disable-next-line no-use-before-define
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  name_feminine?: string;
  name_masculine?: string;
  // eslint-disable-next-line no-use-before-define
  group?: Group;
  holders?: Person[];
  pivot?: {
    main?: boolean;
  };
}

export type RoleWithPartialGroupAndHolders = Omit<Role, 'group' | 'holders'> & {
  // eslint-disable-next-line no-use-before-define
  group?: Partial<Group>;
  holders?: Partial<Person>[];
};

export interface Group {
  id: number;
  name: string;
  description?: string;
  slug: string;
  roles?: Role[];
}

export interface SimplePage {
  languages_code: string;
  title: string;
  body: string;
  path: string;
  key_roles: Role[];
  resources: Resource[];
}

export interface Venue {
  name: string;
  city?: string;
  address?: string;
  url?: string;
}
export interface CalendarEvent {
  id: number;
  name: string;
  date_start: Date;
  date_end: Date;
  time_start: string;
  time_end: string;
  isFullDay: boolean;
  showEndTime: boolean;
  status: string;
  description?: string;
  venue?: Venue;
  image?: {
    id: string;
    description: string;
  };
  url?: string;
  type: number;
}

export interface NationalCompetitionEdition {
  directus_id: number;
  season: DirectusSeason;
  // eslint-disable-next-line no-use-before-define
  competition: NationalCompetition;
  leverade_id?: number;
}

export interface NationalCompetition {
  id: number;
  name: string;
  slug: string;
  editions?: NationalCompetitionEdition[];
}

export interface LiveStream {
  id: number;
  title: string;
  url: string;
  date_start: string;
  date_end: string;
  stream_start: string;
}

export interface CMSService {
  getMainNavigation: () => Promise<DirectusMenuItem[]>;
  getPage: (options: { pagePath: string }) => Promise<SimplePage>;
  getText: (textId: number) => Promise<TextEntry>;
  getDomains: () => Promise<Domain[]>;
  getNews: (options: {
    limit: number;
    page: number;
    domainId?: number;
    withImageOnly?: boolean;
    forHomepage?: boolean;
  }) => Promise<{ data: NewsEntry[]; meta: { total: number; filteredDomainId?: number } }>;
  getOneNews: (newsId: number) => Promise<NewsEntry>;
  getGroups: () => Promise<Group[]>;
  getGroup: ({ id, slug }: { id?: number; slug?: string }) => Promise<Group>;
  getRole: (roleId: number) => Promise<RoleWithPartialGroupAndHolders>;
  getStaff: ({ groupId, groupSlug }: { groupId?: number; groupSlug?: string }) => Promise<Person[]>;
  getClubs: (options: { statuses: string[] }) => Promise<DirectusClub[]>;
  getPressReleaseList: (options: {
    limit: number;
    page: number;
  }) => Promise<{ data: PressRelease[]; meta: { total: number } }>;
  getPressRelease: (pressReleaseId: number) => Promise<PressRelease>;
  getEventTypes: () => Promise<EventTypes>;
  getEvent: (eventId: number) => Promise<CalendarEvent>;
  getEvents: (options: {
    limit: number;
    page?: number;
    typeId?: number;
    startDateBefore?: Date;
    startDateAfter?: Date;
    endDateBefore?: Date;
    endDateAfter?: Date;
    month?: string;
    upcoming?: boolean;
    excludeCancelled?: boolean;
  }) => Promise<{ data: CalendarEvent[]; meta: { total: number } }>;
  getPlayerPositions: () => Promise<PlayerPositions>;
  getTeam: (teamSlug: string) => Promise<NationalTeam>;
  getNationalTeamCompetition: ({ id, slug }: { id?: number; slug?: string }) => Promise<NationalTeamCompetition>;
  getNationalTeamCompetitionUpdates: (
    nationalTeamCompetitionId: number,
    options: { limit: number; page: number; keyOnly?: boolean; withImage?: boolean; teamId?: number }
  ) => Promise<{ data: NationalTeamCompetitionUpdate[]; meta: { total: number } }>;
  getNationalTeamsForCompetition: (
    nationalTeamCompetitionId: number
  ) => Promise<Omit<NationalTeamForCompetition, 'competition'>[]>;
  getSeasons: () => Promise<DirectusSeason[]>;
  getLiveStreams: () => Promise<LiveStream[]>;
  getNationalCompetition: (competitionSlug: string) => Promise<NationalCompetition>;
  getNationalCompetitionEditions: ({
    competitionSlug,
    seasonSlug,
    leveradeIds,
  }: {
    competitionSlug?: string;
    seasonSlug?: string;
    leveradeIds?: string[];
  }) => Promise<NationalCompetitionEdition[]>;
  getMatchAdditionalData: (leveradeId: number) => Promise<DirectusMatchAdditionalData | null>;
  getTchoukups: (options: { limit: number; page: number }) => Promise<{ data: Tchoukup[]; meta: { total: number } }>;
  getResourceTypes: () => Promise<ResourceType[]>;
  searchResources: (searchTerm: string, domainId?: number, typeId?: number) => Promise<Resource[]>;
  getResource: (resourceId: number) => Promise<Resource>;
}

declare module 'vue/types/vue' {
  // this.$cmsService inside Vue components
  interface Vue {
    $cmsService: CMSService;
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$cmsService inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $cmsService: CMSService;
  }
  // nuxtContext.$cmsService
  interface Context {
    $cmsService: CMSService;
  }
}

declare module 'vuex/types/index' {
  // this.$cmsService inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $cmsService: CMSService;
  }
}

const cmsService: Plugin = (context, inject) => {
  const processRoles = (directusRoles: (DirectusRole | undefined)[]) => {
    return directusRoles.reduce((roles, role) => {
      if (!role || !role.id) {
        return roles;
      }

      const translatedRoleFields = getTranslatedFields(role);

      if (!translatedRoleFields?.name) {
        return roles;
      }

      const translatedGroupFields = role.group ? getTranslatedFields(role.group) : {};

      return [
        ...roles,
        {
          id: role.id,
          name: translatedRoleFields.name,
          name_feminine: translatedRoleFields.name_feminine,
          name_masculine: translatedRoleFields.name_masculine,
          group: role.group
            ? {
                id: role.group.id,
                name: translatedGroupFields?.name,
              }
            : null,
          holders: role.holders ? role.holders.map((holder) => holder?.people_id).filter((holder) => holder) : [],
        },
      ] as Role[];
    }, [] as Role[]);
  };

  /**
   * Fetches the data of a simple page for a specific locale
   */
  const fetchPage = async (pagePath: string, locale: string) => {
    const pages = await context.$directus.request<DirectusPage[]>(
      readItems('pages', {
        filter: { translations: { path: { _eq: pagePath } } },
        fields: [
          'id',
          {
            translations: ['languages_code', 'path', 'title', 'body'],
            key_roles: [
              {
                roles_id: [
                  'id',
                  {
                    translations: ['name', 'name_feminine', 'name_masculine'],
                    holders: [
                      {
                        people_id: ['id', 'first_name', 'last_name', 'email', 'gender', 'portrait_square_head'],
                      },
                    ],
                  },
                ],
              },
            ],
            resources: [
              {
                resources_id: [
                  'id',
                  'type',
                  {
                    file: ['id', 'type', 'filesize', 'filename_download'],
                    domains: ['id'],
                    translations: [
                      'name',
                      'link',
                      {
                        file: ['id', 'type', 'filesize', 'filename_download'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        deep: {
          translations: { _filter: { languages_code: { _eq: locale } } },
          key_roles: { roles_id: { translations: { _filter: { languages_code: { _eq: locale } } } } },
        },
        limit: 1,
      })
    );

    if (!pages?.length) {
      throw new Error('pageNotFound');
    }

    const requestedPage = pages[0];

    if (!requestedPage.translations?.length || !requestedPage.translations[0]) {
      throw new Error('noData');
    }

    const requestedPageTranslations = requestedPage.translations[0];

    if (
      !requestedPageTranslations.languages_code ||
      !requestedPageTranslations.path ||
      !requestedPageTranslations.title ||
      !requestedPageTranslations.body
    ) {
      throw new Error('Missing required data for simple page');
    }

    const pageData: SimplePage = {
      languages_code: requestedPageTranslations.languages_code,
      path: requestedPageTranslations.path,
      title: requestedPageTranslations.title,
      body: requestedPageTranslations.body,
      key_roles: [],
      resources: [],
    };

    if (requestedPage.key_roles) {
      // We save the roles in the store and only provide the role IDs with the page data
      pageData.key_roles.push(...processRoles(requestedPage.key_roles.map((pageRole) => pageRole?.roles_id)));
    }

    if (requestedPage.resources) {
      // We save the resources in the store and only provide the resource IDs with the page data
      pageData.resources.push(
        ...requestedPage.resources.reduce((resources, resourcePageRelation) => {
          if (!resourcePageRelation?.resources_id?.id) {
            return resources;
          }

          const resource = resourcePageRelation.resources_id;
          const translatedFields = getTranslatedFields(resource, locale);

          if (!translatedFields?.name) {
            return resources;
          }

          return [
            ...resources,
            {
              ...resource,
              name: translatedFields?.name,
              file: translatedFields?.file,
              link: translatedFields?.link,
            },
          ] as Resource[];
        }, [] as Resource[])
      );
    }

    return pageData;
  };

  const getMainNavigation: CMSService['getMainNavigation'] = async () => {
    const currentLocale = context.i18n.locale;
    return await context.$directus.request<DirectusMenuItem[]>(
      readItems('menus', {
        filter: { parent: { _eq: 1 } },
        sort: ['sort'],
        deep: {
          translations: { _filter: { languages_code: { _eq: currentLocale } } },
          children: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
        },
        fields: [
          {
            translations: ['languages_code', 'name', 'href'],
            children: [
              'sort', // The API cannot sort in a relation yet. We do it ourselves.
              {
                translations: ['languages_code', 'name', 'href'],
              },
            ],
          },
        ],
      })
    );
  };

  const getText: CMSService['getText'] = async (textId) => {
    // We retrieve all the languages and show text in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const directusTextEntry = await context.$directus.request<DirectusText>(
      readItem('texts', textId, {
        fields: ['id', { translations: ['languages_code', 'body'] }],
      })
    );

    if (!directusTextEntry) {
      throw new Error('Error when retrieving text entry');
    }

    const translatedFields = getTranslatedFields(directusTextEntry, currentLocale);

    if (!directusTextEntry.id || !translatedFields?.body) {
      throw new Error(`Text entry is missing requested fields`);
    }

    const textEntry: TextEntry = {
      id: directusTextEntry.id,
      body: translatedFields.body,
    };

    return textEntry;
  };

  const getDomains: CMSService['getDomains'] = async () => {
    const currentLocale = context.i18n.locale;
    const domainsResponse = await context.$directus.request<DirectusDomain[]>(
      readItems('domains', {
        fields: ['id', { translations: ['name'] }],
        deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
      })
    );

    if (!domainsResponse) {
      throw new Error('Error when retrieving domains');
    }

    const domains = domainsResponse.reduce((domains, domain) => {
      const translatedFields = getTranslatedFields(domain);

      // We discard entries that don't have mandatory data.
      if (!domain?.id || !translatedFields?.name) {
        console.warn('Domain missing mandatory data', { domain });
        return domains;
      }

      return [
        ...domains,
        {
          id: domain.id,
          name: translatedFields?.name,
        },
      ];
    }, [] as Domain[]);

    return domains;
  };

  /**
   * Returns the data of a simple page in the appropriate language based on context and available translations
   */
  const getPage: CMSService['getPage'] = async ({ pagePath }) => {
    let pageData: Await<ReturnType<typeof fetchPage>>;

    try {
      pageData = await fetchPage(pagePath, context.i18n.locale);
    } catch (err: any) {
      if (err.message === 'noData') {
        console.info('No data in the requested locale. Falling back to default locale.');
        pageData = await fetchPage(pagePath, context.i18n.defaultLocale);
      } else {
        throw err;
      }
    }

    return pageData;
  };

  const getNews: CMSService['getNews'] = async ({ limit, page, domainId, withImageOnly, forHomepage }) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const sort: Query<DirectusSchema, DirectusNews>['sort'] = [];

    if (forHomepage) {
      sort.push('-prioritise_on_home');
    }

    sort.push('-date_created');

    const filter = {
      _and: [
        { status: { _eq: 'published' } },
        ...(domainId ? [{ domains: { domains_id: { id: { _eq: domainId } } } }] : []),
        ...(withImageOnly ? [{ main_image: { _nnull: true } }] : []),
        ...(forHomepage ? [{ hide_from_home: { _eq: false } }] : []),
      ],
    };

    const newsResponse = await context.$directus.request<DirectusNews[]>(
      readItems('news', {
        limit,
        page,
        filter,
        fields: [
          'id',
          'date_created',
          'date_updated',
          {
            main_image: ['id', 'description'],
            translations: ['languages_code', 'slug', 'title'],
            domains: [{ domains_id: ['id'] }],
          },
        ],
        sort,
      })
    );

    let newsList: NewsEntry[] = [];
    if (!newsResponse) {
      throw new Error('Error when retrieving news');
    }

    newsList = newsResponse.reduce((news, directusNewsEntry) => {
      if (!directusNewsEntry) {
        return news;
      }

      const translatedFields = getTranslatedFields(directusNewsEntry, currentLocale);

      if (!directusNewsEntry.id || !directusNewsEntry.date_created || !translatedFields?.title) {
        console.warn(`News entry with ID ${directusNewsEntry.id} is missing requested fields`);
        return news;
      }

      const newsEntry: NewsEntry = {
        id: directusNewsEntry.id,
        title: translatedFields.title,
        slug: translatedFields.slug,
        date_created: directusNewsEntry.date_created,
        date_updated: directusNewsEntry.date_updated,
        domain_ids: [],
      };

      if (directusNewsEntry.main_image && directusNewsEntry.main_image.id) {
        newsEntry.main_image = {
          id: directusNewsEntry.main_image.id,
          description: directusNewsEntry.main_image.description || undefined,
        };
      }

      if (directusNewsEntry.domains) {
        newsEntry.domain_ids = directusNewsEntry.domains.reduce((domains, domain) => {
          if (!domain?.domains_id?.id) {
            return domains;
          }

          return [...domains, domain.domains_id.id];
        }, [] as number[]);
      }

      return [...news, newsEntry];
    }, [] as NewsEntry[]);

    let filteredDomainId: number | undefined;
    if (domainId) {
      filteredDomainId = newsList[0].domain_ids.find((id) => id === domainId);
    }

    // TODO: Move this out of the function to call it only once
    const aggregationOutput = await context.$directus.request(
      aggregate('news', {
        aggregate: { count: '*' },
        query: { filter },
      })
    );

    return {
      data: newsList,
      meta: {
        total: aggregationOutput[0].count ? +aggregationOutput[0].count : 0,
        filteredDomainId,
      },
    };
  };

  // FIXME: `getOneNews` is almost identical to `getNews`. Make it more DRY.
  const getOneNews: CMSService['getOneNews'] = async (newsId) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const directusNewsEntry = await context.$directus.request<DirectusNews>(
      readItem('news', newsId, {
        fields: [
          'id',
          'date_created',
          'date_updated',
          {
            main_image: ['id', 'description'],
            translations: ['languages_code', 'slug', 'title', 'body'],
            domains: [{ domains_id: ['id', { translations: ['name'] }] }],
          },
        ],
        deep: {
          domains: { domains_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
        },
      })
    );

    if (!directusNewsEntry) {
      throw new Error('Error when retrieving news');
    }

    const translatedFields = getTranslatedFields(directusNewsEntry, currentLocale);

    if (
      !directusNewsEntry.id ||
      !directusNewsEntry.date_created ||
      !translatedFields?.title ||
      !translatedFields?.body
    ) {
      throw new Error(`News entry is missing requested fields`);
    }

    const newsEntry: NewsEntry = {
      id: directusNewsEntry.id,
      title: translatedFields.title,
      slug: translatedFields.slug,
      body: translatedFields.body,
      date_created: directusNewsEntry.date_created,
      date_updated: directusNewsEntry.date_updated,
      domain_ids: [],
    };

    if (directusNewsEntry.main_image && directusNewsEntry.main_image.id) {
      newsEntry.main_image = {
        id: directusNewsEntry.main_image.id,
        description: directusNewsEntry.main_image.description || undefined,
      };
    }

    if (directusNewsEntry.domains) {
      newsEntry.domain_ids = directusNewsEntry.domains.reduce((domains, domain) => {
        if (!domain?.domains_id?.id) {
          return domains;
        }

        return [...domains, domain.domains_id.id];
      }, [] as number[]);
    }

    return newsEntry;
  };

  const processPressRelease = (directusPressRelease: DirectusPressRelease): PressRelease => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const translatedFields = getTranslatedFields(directusPressRelease, currentLocale);

    if (!directusPressRelease.id || !directusPressRelease.date_created || !translatedFields?.title) {
      throw new Error(`Press release is missing requested fields`);
    }

    const pressRelease: PressRelease = {
      id: directusPressRelease.id,
      title: translatedFields.title,
      slug: translatedFields.slug,
      context: translatedFields.context || undefined,
      status: directusPressRelease.status || 'draft',
      body: translatedFields.body || undefined,
      date_created: directusPressRelease.date_created,
      date_updated: directusPressRelease.date_updated,
    };

    return pressRelease;
  };

  const processGroup = (group: DirectusGroup): Group => {
    const translatedFields = getTranslatedFields(group);

    // We discard entries that don't have mandatory data.
    if (!group.id || !translatedFields?.name || !translatedFields?.slug) {
      throw new Error('Group missing mandatory data');
    }

    return {
      id: group.id,
      name: translatedFields.name,
      description: translatedFields?.description || '',
      slug: translatedFields?.slug,
    };
  };

  const getGroups: CMSService['getGroups'] = async () => {
    const currentLocale = context.i18n.locale;
    const groupsResponse = await context.$directus.request<DirectusGroup[]>(
      readItems('groups', {
        fields: ['id', { translations: ['name', 'description', 'slug'] }],
        deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
      })
    );

    if (!groupsResponse) {
      throw new Error('Error when retrieving groups');
    }

    return groupsResponse.reduce((groups, rawGroup) => {
      try {
        const group = processGroup(rawGroup);
        return [...groups, group];
      } catch (error) {
        console.warn(error);
        return groups;
      }
    }, [] as Group[]);
  };

  const getGroup: CMSService['getGroup'] = async ({ id, slug }) => {
    if (!id && !slug) {
      throw new Error('Either ID or slug must be provided');
    }

    let directusGroup: DirectusGroup;
    const fields: Query<DirectusSchema, DirectusGroup>['fields'] = [
      'id',
      {
        translations: ['name', 'description', 'slug'],
      },
    ];
    const deep = { translations: { _filter: { languages_code: { _eq: context.i18n.locale } } } };
    if (id) {
      directusGroup = await context.$directus.request<DirectusGroup>(
        readItem('groups', id, {
          fields,
          deep,
        })
      );
    } else {
      const groups = await context.$directus.request<DirectusGroup[]>(
        readItems('groups', {
          limit: 1,
          filter: {
            translations: {
              slug: { _eq: slug },
            },
          },
          fields,
          deep,
        })
      );

      directusGroup = groups?.[0];
    }

    if (!directusGroup) {
      throw new Error('Error when retrieving group');
    }

    return processGroup(directusGroup);
  };

  const getRole: CMSService['getRole'] = async (roleId: number) => {
    const rawRole = await context.$directus.request<DirectusRole>(
      readItem('roles', roleId, {
        fields: [
          'id',
          {
            translations: ['name', 'name_feminine', 'name_masculine', 'languages_code'],
            group: [
              'id',
              {
                translations: ['name', 'slug', 'languages_code'],
              },
            ],
            holders: [
              {
                people_id: ['id', 'first_name', 'last_name', 'email', 'gender', 'portrait_square_head'],
              },
            ],
          },
        ],
      })
    );

    if (!rawRole) {
      throw new Error('Error when retrieving role');
    }

    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const translatedFields = getTranslatedFields(rawRole, currentLocale);

    if (!rawRole.id || !translatedFields?.name) {
      throw new Error(`Role is missing requested fields`);
    }

    let group: Partial<Group> | undefined;
    if (rawRole.group) {
      const groupTranslatedFields = getTranslatedFields(rawRole.group, currentLocale);
      if (rawRole.group.id && groupTranslatedFields?.name && groupTranslatedFields?.slug) {
        group = {
          id: rawRole.group.id,
          name: groupTranslatedFields.name,
          slug: groupTranslatedFields.slug,
        };
      }
    }

    const holders: Partial<Person>[] = [];

    rawRole.holders?.forEach((holder) => {
      if (!holder?.people_id) {
        return;
      }
      holders.push({
        id: holder.people_id.id,
        first_name: holder.people_id.first_name,
        last_name: holder.people_id.last_name,
        portrait_square_head: holder.people_id.portrait_square_head,
        gender: holder.people_id.gender as Gender,
        email: holder.people_id.email,
      });
    });

    const role: RoleWithPartialGroupAndHolders = {
      id: rawRole.id,
      name: translatedFields.name,
      name_feminine: translatedFields.name_feminine,
      name_masculine: translatedFields.name_masculine,
      group,
      holders,
    };

    return role;
  };

  const getStaff: CMSService['getStaff'] = async ({ groupId, groupSlug }) => {
    let filter: any = {};

    if (groupId) {
      filter = { roles: { roles_id: { group: { id: groupId } } } };
    } else if (groupSlug) {
      filter = { roles: { roles_id: { group: { translations: { slug: groupSlug } } } } };
    } else {
      // If no group is provided (i.e. the whole staff is requested), we filter the people that don't have any role
      filter = { roles: { _null: false } };
    }

    const peopleResponse = await context.$directus.request<DirectusPerson[]>(
      readItems('people', {
        fields: [
          'id',
          'first_name',
          'last_name',
          'portrait_square_head',
          'gender',
          'email',
          {
            roles: [
              'main',
              {
                roles_id: [
                  'id',
                  {
                    translations: ['name', 'name_feminine', 'name_masculine'],
                    group: [
                      'id',
                      {
                        translations: ['name', 'slug', 'description'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        filter,
        deep: {
          roles: {
            roles_id: {
              translations: { _filter: { languages_code: { _eq: context.i18n.locale } } },
              group: { translations: { _filter: { languages_code: { _eq: context.i18n.locale } } } },
            },
          },
        },
        sort: ['last_name'],
      })
    );

    if (!peopleResponse) {
      throw new Error('Error when retrieving people');
    }

    return peopleResponse.reduce((people, person) => {
      // We discard entries that don't have mandatory data.
      if (!person.id || !person.first_name || !person.last_name) {
        console.warn('Person missing mandatory data', { person });
        return people;
      }

      let roles: Role[] = [];
      if (person.roles) {
        roles = person.roles.reduce((roles, role) => {
          if (!role || !role.roles_id || !role.roles_id.id) {
            return roles;
          }

          const translatedRoleFields = getTranslatedFields(role.roles_id);

          if (!translatedRoleFields?.name) {
            return roles;
          }

          const translatedGroupFields = role.roles_id.group ? getTranslatedFields(role.roles_id.group) : {};

          return [
            ...roles,
            {
              id: role.roles_id.id,
              name: translatedRoleFields.name,
              name_feminine: translatedRoleFields.name_feminine,
              name_masculine: translatedRoleFields.name_masculine,
              group: role.roles_id.group
                ? {
                    id: role.roles_id.group.id,
                    name: translatedGroupFields?.name,
                    slug: translatedGroupFields?.slug,
                    description: translatedGroupFields?.description,
                  }
                : null,
              pivot: {
                main: role.main,
              },
            } as Role,
          ];
        }, [] as Role[]);
      }

      return [
        ...people,
        {
          id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          portrait_square_head: person.portrait_square_head,
          gender: person.gender,
          email: person.email,
          roles,
        } as Person,
      ];
    }, [] as Person[]);
  };

  const getClubs: CMSService['getClubs'] = async ({ statuses }) => {
    const statusFilter = statuses.reduce((filter, status) => {
      return [
        ...filter,
        {
          status: { _eq: status },
        },
      ];
    }, [] as { status: { _eq: string } }[]);

    const clubsResponse = await context.$directus.request<DirectusClub[]>(
      readItems('clubs', {
        fields: ['id', 'name', 'name_full', 'name_sort', 'status', 'website', 'logo'],
        filter: {
          _or: statusFilter,
        },
        sort: ['name_sort'],
      })
    );

    if (!clubsResponse) {
      throw new Error('Error when retrieving clubs');
    }

    return clubsResponse;
  };

  const getPressReleaseList: CMSService['getPressReleaseList'] = async ({ limit, page }) => {
    // Preparing the filter to retrieve the press release
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    const filter = { _and: [publishedFilter] };

    const pressReleaseResponse = await context.$directus.request<DirectusPressRelease[]>(
      readItems('press_releases', {
        limit,
        page,
        filter,
        fields: [
          'id',
          'date_created',
          'date_updated',
          'status',
          {
            translations: ['languages_code', 'slug', 'title', 'context'],
          },
        ],
        sort: ['-date_created'],
      })
    );

    // TODO: Move this out of the function to call it only once
    const aggregationOutput = await context.$directus.request(
      aggregate('press_releases', {
        aggregate: { count: '*' },
        query: { filter },
      })
    );

    let pressReleaseList = [];
    if (!pressReleaseResponse) {
      throw new Error('Error when retrieving press releases');
    }

    pressReleaseList = pressReleaseResponse.reduce((pressReleaseList, directusPressRelease) => {
      if (!directusPressRelease) {
        return pressReleaseList;
      }
      return [...pressReleaseList, processPressRelease(directusPressRelease)];
    }, [] as PressRelease[]);

    return {
      data: pressReleaseList,
      meta: {
        total: aggregationOutput[0].count ? +aggregationOutput[0].count : 0,
      },
    };
  };

  const getPressRelease: CMSService['getPressRelease'] = async (pressReleaseId) => {
    const directusPressRelease = await context.$directus.request<DirectusPressRelease>(
      readItem('press_releases', pressReleaseId, {
        fields: [
          'id',
          'date_created',
          'date_updated',
          'status',
          { translations: ['languages_code', 'slug', 'title', 'context', 'body'] },
        ],
      })
    );

    if (!directusPressRelease) {
      throw new Error('Error when retrieving news');
    }

    return processPressRelease(directusPressRelease);
  };

  const getEventTypes: CMSService['getEventTypes'] = async () => {
    const eventTypes = await context.$directus.request<DirectusEventType[]>(
      readItems('event_types', {
        deep: {
          translations: { _filter: { languages_code: { _eq: context.i18n.locale } } },
        },
        fields: [
          'id',
          {
            translations: ['languages_code', 'name', 'name_plural'],
            image: ['id', 'description'],
          },
        ],
      })
    );

    return eventTypes.reduce((types, type) => {
      const translatedFields = getTranslatedFields(type);

      if (!type?.id || !translatedFields?.name || !translatedFields?.name_plural) {
        return types;
      }

      return {
        ...types,
        [type.id]: {
          id: type.id,
          name: translatedFields.name,
          name_plural: translatedFields.name_plural,
          image: type.image,
        },
      };
    }, {} as EventTypes);
  };

  const processEvent = (directusEvent: DirectusEvent, locale: string): CalendarEvent => {
    const translatedFields = getTranslatedFields(directusEvent, locale);
    if (!directusEvent?.date_start || !translatedFields?.name) {
      throw new Error('Event is missing name or start date');
    }

    let isFullDay = true;
    let showEndTime = false;

    let startDate = new Date(directusEvent.date_start);
    if (directusEvent.time_start) {
      const startTime = directusEvent.time_start.split(':').map((t) => parseInt(t));
      startDate = set(startDate, { hours: startTime[0], minutes: startTime[1] });
      isFullDay = false;
    }

    let endDate: Date;
    if (directusEvent.date_end) {
      endDate = new Date(directusEvent.date_end);
    } else {
      endDate = startDate;
    }
    if (!isFullDay && directusEvent.time_end) {
      const endTime = directusEvent.time_end.split(':').map((t) => parseInt(t));
      endDate = set(endDate, { hours: endTime[0], minutes: endTime[1] });
      showEndTime = true;
    } else {
      // We still set an end time to `endDate` otherwise it's going to be set to midnight and it can create issues for filtering by date
      endDate = set(endDate, { hours: 23, minutes: 59, seconds: 59 });
    }

    let venue: Venue | undefined;
    if (directusEvent.venue) {
      venue = directusEvent.venue;
    } else if (directusEvent.venue_other) {
      venue = {
        name: directusEvent.venue_other,
      };
    }

    const event: CalendarEvent = {
      ...(directusEvent as any),
      name: translatedFields.name,
      description: translatedFields.description,
      date_start: startDate,
      date_end: endDate,
      isFullDay,
      showEndTime,
      venue,
    };

    return event;
  };

  const getEvent: CMSService['getEvent'] = async (eventId) => {
    const response = await context.$directus.request<DirectusEvent>(
      readItem('events', eventId, {
        fields: [
          'id',
          'date_start',
          'time_start',
          'date_end',
          'time_end',
          'status',
          'url',
          'type',
          'venue_other',
          {
            translations: ['languages_code', 'name', 'description'],
            venue: ['id', 'name', 'city', 'address'],
            image: ['id', 'description'],
          },
        ],
      })
    );

    if (!response) {
      throw new Error('No event found for requested ID');
    }

    return processEvent(response, context.i18n.locale);
  };

  const getEvents: CMSService['getEvents'] = async ({
    limit,
    page,
    typeId,
    month,
    startDateBefore,
    startDateAfter,
    endDateBefore,
    endDateAfter,
    upcoming,
    excludeCancelled,
  }) => {
    const currentLocale = context.i18n.locale;

    const filter = {
      _and: [
        {
          _and: [{ status: { _neq: 'draft' } }, ...(excludeCancelled ? [{ status: { _neq: 'cancelled' } }] : [])],
        },
        ...(typeId ? [{ type: { id: { _eq: typeId } } }] : []),
        // It doesn't matter if not all months have 31 days. The filter still does the job as expected.
        ...(month
          ? [{ _and: [{ date_start: { _gte: month + '-01' } }, { date_start: { _lte: month + '-31' } }] }]
          : []),
        ...(startDateBefore ? [{ date_start: { _lte: startDateBefore.toISOString() } }] : []),
        ...(startDateAfter ? [{ date_start: { _gte: startDateAfter.toISOString() } }] : []),
        ...(endDateBefore ? [{ date_end: { _lte: endDateBefore.toISOString() } }] : []),
        ...(endDateAfter ? [{ date_end: { _gte: endDateAfter.toISOString() } }] : []),
        ...(upcoming ? [{ date_start: { _gte: new Date().toISOString() } }] : []),
      ],
    };

    const response = await context.$directus.request<DirectusEvent[]>(
      readItems('events', {
        limit,
        page: page || 1,
        filter,
        fields: [
          'id',
          'date_start',
          'time_start',
          'date_end',
          'time_end',
          'status',
          'url',
          'type',
          'venue_other',
          {
            translations: ['languages_code', 'name', 'description'],
            venue: ['id', 'name', 'city', 'address'],
            image: ['id', 'description'],
          },
        ],
      })
    );

    // TODO: Move this out of the function to call it only once
    const aggregationOutput = await context.$directus.request(
      aggregate('events', {
        aggregate: { count: '*' },
        query: { filter },
      })
    );

    let events = [];
    if (!response) {
      throw new Error('Error when retrieving events');
    }

    events = response.reduce((events, directusEvent) => {
      let event: CalendarEvent;
      try {
        event = processEvent(directusEvent, currentLocale);
      } catch (error) {
        console.warn(`Could not process event with ID ${directusEvent.id}`);
        console.error(error);
        return events;
      }

      return [...events, event];
    }, [] as CalendarEvent[]);

    return {
      data: events,
      meta: {
        total: aggregationOutput[0].count ? +aggregationOutput[0].count : 0,
      },
    };
  };

  const getPlayerPositions: CMSService['getPlayerPositions'] = async () => {
    const playerPositions = await context.$directus.request<DirectusPlayerPosition[]>(
      readItems('player_positions', {
        deep: {
          translations: { _filter: { languages_code: { _eq: context.i18n.locale } } },
        },
        fields: [
          'id',
          {
            translations: ['languages_code', 'name', 'name_feminine', 'name_masculine'],
          },
        ],
      })
    );

    return playerPositions.reduce((positions, position) => {
      const translatedFields = getTranslatedFields(position);

      if (!position?.id || !translatedFields?.name) {
        return positions;
      }

      return {
        ...positions,
        [position.id]: {
          id: position.id,
          name: translatedFields.name,
          name_feminine: translatedFields.name_feminine,
          name_masculine: translatedFields.name_masculine,
        },
      };
    }, {} as PlayerPositions);
  };

  const getTeam: CMSService['getTeam'] = async (teamSlug) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const teamResponse = await context.$directus.request<DirectusTeam[]>(
      readItems('national_teams', {
        limit: 1,
        filter: {
          translations: {
            slug: { _eq: teamSlug },
          },
        },
        fields: [
          'gender',
          'nations_cup_results',
          'team_photo_vertical_shift',
          {
            team_photo: ['id', 'description'],
            translations: ['languages_code', 'name', 'slug'],
            players: [
              'id',
              'first_name',
              'last_name',
              'number',
              'is_captain',
              'birth_year',
              'gender',
              'date_start',
              'date_end',
              'track_record',
              'portrait_square_head',

              {
                club: ['name'],
                positions: ['player_positions_id'],
              },
            ],
            staff: [
              {
                roles_id: [
                  'id',
                  {
                    translations: ['name', 'name_feminine', 'name_masculine'],
                    holders: [
                      {
                        people_id: ['id', 'first_name', 'last_name', 'gender', 'email', 'portrait_square_head'],
                      },
                    ],
                  },
                ],
              },
            ],
            results: [
              'ranking',
              {
                competition_id: [
                  'logo',
                  'year',
                  {
                    translations: ['languages_code', 'name', 'city', 'country'],
                  },
                ],
              },
            ],
          },
        ],
        deep: {
          translations: { _filter: { languages_code: { _eq: currentLocale } } },
          staff: { roles_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
          // TODO: uncomment the filter below once the filter on date fields is fixed https://github.com/directus/directus/issues/6494
          // players: {
          //   _filter: {
          //     _or: [{ date_end: { _gte: context.$formatDate(new Date(), 'yyyy-MM-dd') } }, { date_end: { _null: true } }],
          //   },
          // },
        },
      })
    );

    if (!teamResponse) {
      throw new Error('Error when retrieving team');
    }

    const rawTeam = teamResponse[0];

    if (!rawTeam) {
      throw new Error('No team found');
    }

    const players: any[] = processRawPlayers(rawTeam.players);

    // We sort the results because the API can't do it yet (only at the root)
    let results: NationalTeamResult[] =
      rawTeam.results?.map((result) => {
        if (!result?.competition_id) {
          console.warn('Unknown competition for team result');
          return result;
        }

        const competitionTranslations = getTranslatedFields(result.competition_id, currentLocale);

        if (!competitionTranslations?.name) {
          console.warn('Competition has no name', result.competition_id);
          return result;
        }

        return {
          competition: {
            ...result?.competition_id,
            name: competitionTranslations.name,
            city: competitionTranslations.city,
            country: competitionTranslations.country,
          },
          ranking: result?.ranking,
        } as any;
      }) || [];
    results = results.sort((resultA, resultB) => resultB.competition.year - resultA.competition.year);

    // Fallback for mandatory fields
    const team = {
      name: 'No name',
      slug: 'unknown',
      gender: rawTeam.gender || 'mixed',
      team_photo: rawTeam.team_photo,
      team_photo_vertical_shift: rawTeam.team_photo_vertical_shift,
      players,
      staff: [] as Role[],
      results,
      nationsCupResults: (rawTeam.nations_cup_results as any) || {},
    };

    const teamTranslations = getTranslatedFields(rawTeam);
    if (!teamTranslations?.name || !teamTranslations?.slug) {
      throw new Error('Team is missing requested fields');
    }
    team.name = teamTranslations.name || team.name;
    team.slug = teamTranslations.slug || team.slug;

    if (rawTeam.staff) {
      team.staff.push(...processRoles(rawTeam.staff.map((pageRole) => pageRole?.roles_id)));
    }

    const today = new Date();

    // Manually filtering players until the API filter on date fields is fixed https://github.com/directus/directus/issues/6494
    team.players = team.players.filter(
      (player: any) => player && (!player.date_end || player.date_end >= context.$formatDate(today, 'yyyy-MM-dd'))
    );

    return team;
  };

  const getNationalTeamCompetition: CMSService['getNationalTeamCompetition'] = async ({ id, slug }) => {
    // We retrieve all the languages and display texts in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    let filter: any = {};

    if (id) {
      filter = { id };
    } else if (slug) {
      filter = { slug };
    }

    const competitionResponse = await context.$directus.request<DirectusNationalTeamCompetition[]>(
      readItems('national_team_competitions', {
        limit: 1,
        filter,
        fields: [
          'id',
          'slug',
          'logo',
          'year',
          'date_start',
          'date_end',
          'telegram_channel',
          {
            teams: [
              {
                team: [
                  'id',
                  {
                    translations: ['languages_code', 'name'],
                  },
                ],
              },
            ],
            translations: ['languages_code', 'name', 'city', 'country', 'live', 'about', 'schedule', 'medias'],
          },
        ],
      })
    );

    if (!competitionResponse) {
      throw new Error('Error when retrieving national team competition');
    }

    const rawNationalTeamCompetition = competitionResponse[0];

    if (!rawNationalTeamCompetition) {
      throw new Error('No national team competition found');
    }

    const translations = getTranslatedFields(rawNationalTeamCompetition, currentLocale);

    if (
      !rawNationalTeamCompetition?.id ||
      !rawNationalTeamCompetition.year ||
      !translations?.name ||
      !translations.city ||
      !translations.country
    ) {
      throw new Error('National team competition is missing requested fields');
    }

    let teams: { id: number; name: string }[] = [];
    if (rawNationalTeamCompetition.teams?.length) {
      teams = rawNationalTeamCompetition.teams.reduce((teams, team) => {
        let teamTranslations;

        if (team?.team?.id) {
          teamTranslations = getTranslatedFields(team.team, currentLocale);
          if (teamTranslations?.name) {
            return [...teams, { id: team.team.id, name: teamTranslations.name as string }];
          }
        }

        return teams;
      }, [] as { id: number; name: string }[]);
    }

    return {
      id: rawNationalTeamCompetition.id,
      slug: rawNationalTeamCompetition.slug || null,
      logo: rawNationalTeamCompetition.logo,
      year: rawNationalTeamCompetition.year,
      date_start: rawNationalTeamCompetition.date_start,
      date_end: rawNationalTeamCompetition.date_end,
      name: translations.name,
      city: translations.city,
      live: translations.live || null,
      about: translations.about || null,
      schedule: translations.schedule || null,
      medias: translations.medias || null,
      country: translations.country,
      teams,
      telegram_channel: rawNationalTeamCompetition.telegram_channel,
    };
  };

  const getNationalTeamCompetitionUpdates: CMSService['getNationalTeamCompetitionUpdates'] = async (
    nationalTeamCompetitionId,
    { limit, page, keyOnly, withImage, teamId }
  ) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const filter: any = {
      competition: {
        id: nationalTeamCompetitionId,
      },
      status: 'published',
    };

    if (keyOnly) {
      filter.is_key = true;
    }

    if (withImage) {
      filter.image = { _nnull: true };
    }

    if (teamId) {
      filter.teams = { team_id: { team: { id: { _eq: teamId } } } };
    }

    const updatesResponse = await context.$directus.request<DirectusNationalTeamCompetitionUpdate[]>(
      readItems('national_teams_competitions_updates', {
        limit,
        page,
        filter,
        fields: [
          'id',
          'is_key',
          'date_created',
          'date_updated',
          {
            translations: ['languages_code', 'body'],
            image: ['id', 'description'],
            teams: [
              {
                team_id: [
                  {
                    team: [
                      'id',
                      {
                        translations: ['languages_code', 'name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        sort: ['-date_created'],
      })
    );

    // TODO: Move this out of the function to call it only once
    const aggregationOutput = await context.$directus.request(
      aggregate('national_teams_competitions_updates', {
        aggregate: { count: '*' },
        query: { filter },
      })
    );
    if (!updatesResponse) {
      throw new Error('Error when retrieving updates for national team competitions');
    }

    const updateList = updatesResponse.reduce((updates, rawUpdate) => {
      const updateTranslations = getTranslatedFields(rawUpdate, currentLocale);
      if (!rawUpdate.id || !rawUpdate.date_created || !updateTranslations?.body) {
        console.warn(`Update for national team competition with ID ${rawUpdate.id} is missing requested fields`);
        return updates;
      }

      let teams: { id: number; name: string }[] = [];
      if (rawUpdate.teams?.length) {
        teams = rawUpdate.teams.reduce((teams, team) => {
          let teamTranslations;

          if (team?.team_id?.team?.id) {
            teamTranslations = getTranslatedFields(team.team_id.team, currentLocale);
            if (teamTranslations?.name) {
              return [...teams, { id: team.team_id.team.id, name: teamTranslations.name as string }];
            }
          }

          return teams;
        }, [] as { id: number; name: string }[]);
      }

      return [
        ...updates,
        {
          id: rawUpdate.id,
          image: rawUpdate.image,
          body: updateTranslations.body,
          is_key: !!rawUpdate.is_key,
          teams,
          date_created: rawUpdate.date_created,
          date_updated: rawUpdate.date_updated,
        },
      ];
    }, [] as NationalTeamCompetitionUpdate[]);

    return {
      data: updateList,
      meta: {
        total: aggregationOutput[0].count ? +aggregationOutput[0].count : 0,
      },
    };
  };

  const getNationalTeamsForCompetition: CMSService['getNationalTeamsForCompetition'] = async (
    nationalTeamCompetitionId
  ) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const teamResponse = await context.$directus.request<DirectusNationalTeamCompetitionsTeam[]>(
      readItems('national_team_competitions_teams', {
        filter: {
          competition: {
            id: { _eq: nationalTeamCompetitionId },
          },
        },
        fields: [
          'id',
          {
            team: [
              {
                translations: ['languages_code', 'name', 'slug'],
              },
            ],
            players: [
              {
                national_team_players_id: [
                  'id',
                  'first_name',
                  'last_name',
                  'number',
                  'is_captain',
                  'birth_year',
                  'gender',
                  'date_start',
                  'date_end',
                  'track_record',
                  'portrait_square_head',
                  {
                    club: ['name'],
                    positions: ['player_positions_id'],
                  },
                ],
              },
            ],
            coaches: [
              {
                people_id: ['id', 'first_name', 'last_name', 'gender', 'email', 'portrait_square_head'],
              },
            ],
          },
        ],
        deep: {
          team: { translation: { _filter: { language_code: { _eq: currentLocale } } } },
        },
      })
    );

    if (!teamResponse) {
      throw new Error('Error when retrieving national teams for competitions');
    }

    return teamResponse.map((rawTeam) => {
      if (!rawTeam.id || !rawTeam.team) {
        throw new Error(`Team for national competition with ID ${rawTeam.id} is missing team or competition`);
      }

      const teamTranslations = getTranslatedFields(rawTeam.team);
      if (!teamTranslations?.name || !teamTranslations.slug) {
        throw new Error(`Team for national competition with ID ${rawTeam.id} is missing requested fields`);
      }

      return {
        id: rawTeam.id,
        team: {
          name: teamTranslations.name,
          slug: teamTranslations.slug,
        },
        players: processRawPlayers(rawTeam.players?.map((player) => player?.national_team_players_id)),
        coaches: processRawCoaches(rawTeam.coaches?.map((coach) => coach?.people_id)),
      };
    });
  };

  const getSeasons: CMSService['getSeasons'] = async () => {
    const seasonsResponse = await context.$directus.request<DirectusSeason[]>(
      readItems('seasons', {
        fields: ['id', 'name', 'slug', 'date_start', 'date_end', 'leverade_id'],
        sort: ['-slug'],
      })
    );

    if (!seasonsResponse) {
      throw new Error('Error when retrieving seasons');
    }

    const seasons = seasonsResponse.reduce((seasons, season) => {
      // We discard seasons that don't have mandatory data.
      if (season.id && season.name && season.slug && season.date_start && season.date_end) {
        return [
          ...seasons,
          {
            id: season.id,
            name: season.name,
            slug: season.slug,
            date_start: season.date_start,
            date_end: season.date_end,
            leverade_id: season.leverade_id,
          },
        ];
      }
      console.warn('Season missing mandatory data', { season });
      return seasons;
    }, [] as DirectusSeason[]);

    return seasons;
  };

  const getLiveStreams: CMSService['getLiveStreams'] = async () => {
    const now = new Date();

    const liveStreamsResponse = await context.$directus.request<DirectusLiveStream[]>(
      readItems('live_streams', {
        fields: [
          'id',
          'url',
          'date_start',
          'date_end',
          'stream_start',
          {
            translations: ['languages_code', 'title'],
          },
        ],
        sort: ['stream_start'],
        filter: {
          _and: [
            {
              date_start: {
                _lte: toISOLocal(now),
              },
            },
            {
              date_end: {
                _gte: toISOLocal(now),
              },
            },
          ],
        },
      })
    );

    if (!liveStreamsResponse) {
      throw new Error('Error when retrieving seasons');
    }

    // We retrieve all the languages and show text in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const liveStreams = liveStreamsResponse.reduce((liveStreams, liveStream) => {
      const translatedFields = getTranslatedFields(liveStream, currentLocale);

      // We discard live streams that don't have mandatory data.
      if (
        liveStream.id &&
        translatedFields?.title &&
        liveStream.url &&
        liveStream.date_start &&
        liveStream.date_end &&
        liveStream.stream_start
      ) {
        return [
          ...liveStreams,
          {
            id: liveStream.id,
            title: translatedFields.title,
            url: liveStream.url,
            date_start: liveStream.date_start,
            date_end: liveStream.date_end,
            stream_start: liveStream.stream_start,
          },
        ];
      }
      console.warn('Live stream missing mandatory data', { liveStream });
      return liveStreams;
    }, [] as LiveStream[]);

    return liveStreams;
  };

  const processNationalCompetition = (rawCompetition: DirectusNationalCompetition): NationalCompetition => {
    const translatedFields = getTranslatedFields(rawCompetition);

    if (!rawCompetition.id || !translatedFields?.name || !translatedFields?.slug) {
      throw new Error('Competition is missing requested fields');
    }

    // Fallback for mandatory fields should not happen as we requested those fields

    return {
      id: rawCompetition.id,
      name: translatedFields.name,
      slug: translatedFields.slug,
      editions: (rawCompetition.editions as any) || [],
    };
  };

  const getNationalCompetition: CMSService['getNationalCompetition'] = async (competitionSlug) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const response = await context.$directus.request<DirectusNationalCompetition[]>(
      readItems('national_competitions', {
        limit: 1,
        filter: {
          translations: {
            slug: { _eq: competitionSlug },
          },
        },
        fields: [
          'id',
          {
            translations: ['languages_code', 'name', 'slug'],
            editions: [
              'leverade_id',
              {
                season: ['id', 'name', 'slug', 'leverade_id'],
              },
            ],
          },
        ],
        deep: {
          translations: { _filter: { languages_code: { _eq: currentLocale } } },
        },
      })
    );

    if (!response) {
      throw new Error('Error when retrieving competition');
    }

    const rawCompetition = response[0];

    if (!rawCompetition) {
      throw new Error('No competition found');
    }

    return processNationalCompetition(rawCompetition);
  };

  const getNationalCompetitionEditions: CMSService['getNationalCompetitionEditions'] = async ({
    competitionSlug,
    seasonSlug,
    leveradeIds,
  }) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    let filter: Query<DirectusSchema, DirectusNationalCompetitionEdition>['filter'] = {};

    if (leveradeIds) {
      filter = {
        leverade_id: {
          _in: leveradeIds.map((id) => parseInt(id)),
        },
      };
    } else {
      filter = {
        _and: [],
      };
      if (competitionSlug) {
        filter._and!.push({
          competition: {
            translations: {
              slug: { _eq: competitionSlug },
            },
          },
        });
      }
      if (seasonSlug) {
        filter._and!.push({
          season: {
            slug: { _eq: seasonSlug },
          },
        });
      }
    }

    const response = await context.$directus.request<DirectusNationalCompetitionEdition[]>(
      readItems('national_competition_editions', {
        filter,
        fields: [
          'id',
          'leverade_id',
          {
            season: ['id', 'name', 'slug', 'date_start', 'date_end', 'leverade_id'],
            competition: ['id', { translations: ['name', 'slug'] }],
          },
        ],
        deep: {
          competition: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
        },
      })
    );

    if (!response) {
      throw new Error('Error when retrieving competition edition');
    }

    return response.reduce((editions, rawEdition) => {
      if (!rawEdition.competition) {
        return editions;
      }

      let competition: NationalCompetition;

      try {
        competition = processNationalCompetition(rawEdition.competition);
      } catch (error) {
        console.error(error);
        console.warn('Could not instantiate Competition when retrieving editions');
        return editions;
      }

      if (
        !rawEdition.id ||
        !rawEdition.season?.id ||
        !rawEdition.season?.name ||
        !rawEdition.season?.slug ||
        !rawEdition.season?.date_start ||
        !rawEdition.season?.date_end ||
        !rawEdition.season?.leverade_id ||
        !rawEdition.leverade_id
      ) {
        return editions;
      }

      return [
        ...editions,
        {
          directus_id: rawEdition.id,
          season: {
            id: rawEdition.season.id,
            name: rawEdition.season.name,
            slug: rawEdition.season.slug,
            date_start: rawEdition.season.date_start,
            date_end: rawEdition.season.date_end,
            leverade_id: rawEdition.season.leverade_id,
          },
          competition,
          leverade_id: rawEdition.leverade_id,
        },
      ];
    }, [] as NationalCompetitionEdition[]);
  };

  const getMatchAdditionalData: CMSService['getMatchAdditionalData'] = async (leveradeId) => {
    const response = await context.$directus.request<DirectusMatchAdditionalData[]>(
      readItems('match_additional_data', {
        limit: 1,
        filter: {
          leverade_id: {
            _eq: leveradeId,
          },
        },
        fields: ['id', 'leverade_id', 'flickr_photoset_id'],
      })
    );

    if (!response) {
      throw new Error('Could not retrieve match additional data');
    }

    if (!response.length) {
      // No additional data for this match
      return null;
    }

    const rawData = response[0];

    if (!rawData.id || !rawData.leverade_id) {
      throw new Error('Match additional data is missing mandatory attributes');
    }

    return {
      id: rawData.id,
      leverade_id: rawData.leverade_id,
      flickr_photoset_id: rawData.flickr_photoset_id,
    };
  };

  const getTchoukups: CMSService['getTchoukups'] = async ({ limit, page }) => {
    const tchoukupResponse = await context.$directus.request<DirectusTchoukup[]>(
      readItems('tchoukup', {
        limit,
        page,
        fields: [
          'id',
          'number',
          'releaseDate',
          {
            cover: ['id', 'description'],
            file: ['id', 'type', 'filesize', 'filename_download'],
          },
        ],
        sort: ['-releaseDate'],
      })
    );

    // TODO: Move this out of the function to call it only once
    const aggregationOutput = await context.$directus.request(
      aggregate('tchoukup', {
        aggregate: { count: '*' },
      })
    );

    let tchoukupList = [];
    if (!tchoukupResponse) {
      throw new Error('Error when retrieving Tchoukups');
    }

    tchoukupList = tchoukupResponse.reduce((tchoukups, directusTchoukup) => {
      if (!directusTchoukup) {
        return tchoukups;
      }

      if (!directusTchoukup.id || !directusTchoukup.number || !directusTchoukup.file) {
        console.warn(`Tchoukup entry with ID ${directusTchoukup.id} is missing requested fields`);
        return tchoukups;
      }

      const tchoukupIssue: Tchoukup = {
        id: directusTchoukup.id,
        number: directusTchoukup.number,
        releaseDate: directusTchoukup.releaseDate,
        file: directusTchoukup.file as DirectusFile<DirectusSchema>,
      };

      if (directusTchoukup.cover && directusTchoukup.cover.id) {
        tchoukupIssue.cover = {
          id: directusTchoukup.cover.id,
          description: directusTchoukup.cover.description || '',
        };
      }

      return [...tchoukups, tchoukupIssue];
    }, [] as Tchoukup[]);

    return {
      data: tchoukupList,
      meta: {
        total: aggregationOutput[0].count ? +aggregationOutput[0].count : 0,
      },
    };
  };

  const getResourceTypes: CMSService['getResourceTypes'] = async () => {
    const currentLocale = context.i18n.locale;
    const response = await context.$directus.request<DirectusResourceType[]>(
      readItems('resource_types', {
        fields: ['id', { translations: ['name'] }],
        deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
      })
    );

    if (!response) {
      throw new Error('Error when retrieving resource types');
    }

    const resourceTypes = response.reduce((resourceTypes, resourceType) => {
      const translatedFields = getTranslatedFields(resourceType);

      // We discard entries that don't have mandatory data.
      if (!resourceType?.id || !translatedFields?.name) {
        console.warn('Resource type missing mandatory data', { resourceType });
        return resourceTypes;
      }

      return [
        ...resourceTypes,
        {
          id: resourceType.id,
          name: translatedFields.name,
        },
      ];
    }, [] as { id: number; name: string }[]);

    return resourceTypes;
  };

  const processResource = (directusResource: DirectusResource, locale: string): Resource => {
    if (!directusResource) {
      throw new Error('Resource is not defined');
    }

    const translatedFields = getTranslatedFields(directusResource, locale);

    if (!translatedFields?.name) {
      throw new Error('Resource is missing mandatory field');
    }

    const typeTranslatedFields = getTranslatedFields(directusResource.type, locale);

    const temp: Resource = {
      id: directusResource.id,
      name: translatedFields.name,
      file: translatedFields?.file,
      link: translatedFields?.link,
      type: {
        id: directusResource.type.id,
        name: typeTranslatedFields?.name,
      },
      domain_ids: directusResource.domains.map((domain) => domain.domains_id.id),
      date: directusResource.date,
      status: directusResource.status,
    };

    return temp;
  };

  const searchResources: CMSService['searchResources'] = async (searchTerm, domainId, typeId) => {
    // We retrieve all the languages and show resources in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const filter: Query<DirectusSchema, DirectusResource>['filter'] = {
      _and: [
        {
          status: { _eq: DirectusResourceStatus.VISIBLE },
        },
      ],
    };

    if (searchTerm) {
      // We use the filter because the search capability of Directus only work on root level items, not relations
      filter._and!.push({
        _or: [
          {
            keywords: { _contains: searchTerm },
          },
          {
            translations: {
              name: { _contains: searchTerm },
            },
          },
        ],
      });
    }

    if (domainId) {
      filter._and!.push({
        domains: { domains_id: { id: { _eq: domainId } } },
      });
    }

    if (typeId) {
      filter._and!.push({
        type: { id: { _eq: typeId } },
      });
    }

    const response = await context.$directus.request<DirectusResource[]>(
      readItems('resources', {
        filter,
        fields: [
          'id',
          'date',
          'type',
          {
            domains: [{ domains_id: ['id'] }],
            translations: [
              'languages_code',
              'name',
              'link',
              {
                file: ['id', 'type', 'filesize', 'filename_download'],
              },
            ],
          },
        ],
      })
    );

    if (!response) {
      throw new Error('Error when retrieving resources');
    }

    const resources: Resource[] = [];

    response.forEach((directusResource) => {
      try {
        const resource = processResource(directusResource, currentLocale);
        resources.push(resource);
      } catch (error) {
        console.error(error);
      }
    });

    return resources.sort((resourceA, resourceB) => resourceA.name.localeCompare(resourceB.name));
  };

  const getResource: CMSService['getResource'] = async (resourceId) => {
    const response = await context.$directus.request<DirectusResource>(
      readItem('resources', resourceId, {
        fields: [
          'id',
          'date',
          'status',
          'type',
          {
            domains: [{ domains_id: ['id'] }],
            translations: [
              'languages_code',
              'name',
              'link',
              {
                file: ['id', 'type', 'filesize', 'filename_download'],
              },
            ],
          },
        ],
      })
    );

    if (!response) {
      throw new Error('No resource found for requested ID');
    }

    return processResource(response, context.i18n.locale);
  };

  inject('cmsService', {
    getMainNavigation,
    getPage,
    getText,
    getDomains,
    getNews,
    getOneNews,
    getEventTypes,
    getEvent,
    getGroups,
    getGroup,
    getRole,
    getStaff,
    getClubs,
    getPressReleaseList,
    getPressRelease,
    getEvents,
    getPlayerPositions,
    getTeam,
    getNationalTeamCompetition,
    getNationalTeamCompetitionUpdates,
    getNationalTeamsForCompetition,
    getSeasons,
    getLiveStreams,
    getNationalCompetition,
    getNationalCompetitionEditions,
    getMatchAdditionalData,
    getTchoukups,
    getResourceTypes,
    searchResources,
    getResource,
  });
};

export default cmsService;
