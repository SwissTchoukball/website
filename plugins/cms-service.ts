import { Plugin } from '@nuxt/types';
import { set } from 'date-fns';
import { Filter, OneItem, PartialItem } from '@directus/sdk';
import { Await } from '~/types/types.utils';
import {
  DirectusClub,
  DirectusEvent,
  DirectusFile,
  DirectusGroup,
  DirectusMatchAdditionalData,
  DirectusNationalCompetitionEdition,
  DirectusPressRelease,
  DirectusResourceStatus,
  DirectusRole,
  DirectusSeason,
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
import { processRawPlayers } from '~/plugins/cms-service/national-teams';
import { PressRelease } from '~/components/press-releases/press-releases';
import { toISOLocal } from '~/utils/utils';

export interface ResourceType {
  id: number;
  name: string;
}

export interface Resource {
  id: number;
  name: string;
  file: DirectusFile;
  link: string;
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
  competition: number | NationalCompetition;
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
  getPage: (options: { pagePath: string }) => Promise<PartialItem<SimplePage>>;
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
  getClubs: (options: { statuses: string[] }) => Promise<PartialItem<DirectusClub>[]>;
  getPressReleaseList: (options: {
    limit: number;
    page: number;
  }) => Promise<{ data: PressRelease[]; meta: { total: number } }>;
  getPressRelease: (pressReleaseId: number) => Promise<PressRelease>;
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
  getTeam: (teamSlug: string) => Promise<NationalTeam>;
  getNationalTeamCompetition: (nationalTeamCompetitionId: number) => Promise<NationalTeamCompetition>;
  getNationalTeamCompetitionUpdates: (
    nationalTeamCompetitionId: number,
    options: { limit: number; page: number }
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
  const processRoles = (directusRoles: (PartialItem<DirectusRole> | undefined)[]) => {
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
    const pageResponse = await context.$directus.items('pages').readByQuery({
      // @ts-ignore Bug with Directus SDK. It's okay to filter more than one level deep.
      filter: { translations: { path: { _eq: pagePath } } },
      fields: [
        'id',
        'translations.languages_code',
        'translations.path',
        'translations.title',
        'translations.body',
        'key_roles.roles_id.id',
        'key_roles.roles_id.translations.name',
        'key_roles.roles_id.translations.name_feminine',
        'key_roles.roles_id.translations.name_masculine',
        'key_roles.roles_id.holders.people_id.id',
        'key_roles.roles_id.holders.people_id.first_name',
        'key_roles.roles_id.holders.people_id.last_name',
        'key_roles.roles_id.holders.people_id.email',
        'key_roles.roles_id.holders.people_id.gender',
        'key_roles.roles_id.holders.people_id.portrait_square_head',
        'resources.resources_id.id',
        'resources.resources_id.name',
        'resources.resources_id.file.id',
        'resources.resources_id.file.type',
        'resources.resources_id.file.filesize',
        'resources.resources_id.file.filename_download',
        'resources.resources_id.link',
        'resources.resources_id.type',
        'resources.resources_id.domains.domains_id',
        'resources.resources_id.translations.name',
        'resources.resources_id.translations.file.id',
        'resources.resources_id.translations.file.type',
        'resources.resources_id.translations.file.filesize',
        'resources.resources_id.translations.file.filename_download',
        'resources.resources_id.translations.link',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: locale } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        key_roles: { roles_id: { translations: { _filter: { languages_code: { _eq: locale } } } } },
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        resources: { resources_id: { translations: { _filter: { languages_code: { _eq: locale } } } } },
      },
      limit: 1,
    });

    if (!pageResponse.data?.length) {
      throw new Error('pageNotFound');
    }

    if (!pageResponse.data[0].translations?.length || !pageResponse.data[0].translations[0]) {
      throw new Error('noData');
    }

    if (
      !pageResponse.data[0].translations[0].languages_code ||
      !pageResponse.data[0].translations[0].path ||
      !pageResponse.data[0].translations[0].title ||
      !pageResponse.data[0].translations[0].body
    ) {
      throw new Error('Missing required data for simple page');
    }

    const pageData: SimplePage = {
      languages_code: pageResponse.data[0].translations[0].languages_code,
      path: pageResponse.data[0].translations[0].path,
      title: pageResponse.data[0].translations[0].title,
      body: pageResponse.data[0].translations[0].body,
      key_roles: [],
      resources: [],
    };

    if (pageResponse.data[0].key_roles) {
      // We save the roles in the store and only provide the role IDs with the page data
      pageData.key_roles.push(...processRoles(pageResponse.data[0].key_roles.map((pageRole) => pageRole?.roles_id)));
    }

    if (pageResponse.data[0].resources) {
      // We save the resources in the store and only provide the resource IDs with the page data
      pageData.resources.push(
        ...pageResponse.data[0].resources.reduce((resources, resourcePageRelation) => {
          if (!resourcePageRelation?.resources_id?.id) {
            return resources;
          }

          const resource = resourcePageRelation.resources_id;
          const translatedFields = getTranslatedFields(resource);

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

  const getText: CMSService['getText'] = async (textId) => {
    // We retrieve all the languages and show text in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const directusTextEntry = await context.$directus.items('texts').readOne(textId, {
      fields: ['id', 'translations.languages_code', 'translations.body'],
    });

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
    const domainsResponse = await context.$directus.items('domains').readByQuery({
      fields: ['id', 'translations.name'],
      // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
      deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
    });

    if (!domainsResponse.data) {
      throw new Error('Error when retrieving domains');
    }

    const domains = domainsResponse.data.reduce((domains, domain) => {
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

    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    let domainFilter: any;
    if (domainId) {
      domainFilter = {
        domains: { domains_id: { id: { _eq: domainId } } },
      };
    }

    let imageFilter: any;
    if (withImageOnly) {
      imageFilter = { main_image: { _nnull: true } };
    }

    let homepageFilter: any;
    if (forHomepage) {
      homepageFilter = { hide_from_home: { _eq: false } };
    }

    const filter: any = { _and: [publishedFilter] };
    if (domainFilter) {
      filter._and.push(domainFilter);
    }
    if (imageFilter) {
      filter._and.push(imageFilter);
    }
    if (homepageFilter) {
      filter._and.push(homepageFilter);
    }

    const newsResponse = await context.$directus.items('news').readByQuery({
      meta: 'filter_count',
      limit,
      page,
      filter,
      fields: [
        'id',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'domains.domains_id.id',
      ],
      sort: ['-date_created'],
    });

    let totalNewsEntries = 0;
    if (newsResponse?.meta?.filter_count) {
      totalNewsEntries = newsResponse.meta.filter_count;
    }

    let newsList = [];
    if (!newsResponse?.data) {
      throw new Error('Error when retrieving news');
    }

    newsList = newsResponse.data.reduce((news, directusNewsEntry) => {
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
          description: directusNewsEntry.main_image.description,
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

    return {
      data: newsList,
      meta: {
        total: totalNewsEntries,
        filteredDomainId,
      },
    };
  };

  // FIXME: `getOneNews` is almost identical to `getNews`. Make it more DRY.
  const getOneNews: CMSService['getOneNews'] = async (newsId) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const directusNewsEntry = await context.$directus.items('news').readOne(newsId, {
      fields: [
        'id',
        'date_created',
        'date_updated',
        'main_image.id',
        'main_image.description',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.body',
        'domains.domains_id.id',
        'domains.domains_id.name',
        'domains.domains_id.translations.name',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        domains: { domains_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
      },
    });

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
        description: directusNewsEntry.main_image.description,
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

  const processPressRelease = (directusPressRelease: PartialItem<DirectusPressRelease>): PressRelease => {
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

  const processGroup = (group: PartialItem<DirectusGroup>): Group => {
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
    const groupsResponse = await context.$directus.items('groups').readByQuery({
      fields: ['id', 'translations.name', 'translations.description', 'translations.slug'],
      // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
      deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
    });

    if (!groupsResponse.data) {
      throw new Error('Error when retrieving groups');
    }

    return groupsResponse.data.reduce((groups, rawGroup) => {
      try {
        const group = processGroup(rawGroup);
        return [...groups, group];
      } catch (error) {
        console.warn(error);
        return groups;
      }
      // const translatedFields = getTranslatedFields(group);

      // // We discard entries that don't have mandatory data.
      // if (!group.id || !translatedFields?.name || !translatedFields?.slug) {
      //   console.warn('Group missing mandatory data', { group });
      //   return groups;
      // }

      // return [
      //   ...groups,
      //   {
      //     id: group.id,
      //     name: translatedFields.name,
      //     description: translatedFields?.description || '',
      //     slug: translatedFields?.slug,
      //   },
      // ];
    }, [] as Group[]);
  };

  const getGroup: CMSService['getGroup'] = async ({ id, slug }) => {
    if (!id && !slug) {
      throw new Error('Either ID or slug must be provided');
    }

    let directusGroup: OneItem<DirectusGroup>;
    const fields = [
      'id',
      'translations.name',
      'translations.description',
      'translations.slug',
      // 'roles.id',
      // 'roles.translations.name',
      // 'roles.translations.name_feminine',
      // 'roles.translations.name_masculine',
      // 'roles.holders.people_id.id',
      // 'roles.holders.people_id.first_name',
      // 'roles.holders.people_id.last_name',
      // 'roles.holders.people_id.email',
      // 'roles.holders.people_id.gender',
      // 'roles.holders.people_id.portrait_square_head',
    ];
    const deep = { translations: { _filter: { languages_code: { _eq: context.i18n.locale } } } };
    if (id) {
      directusGroup = await context.$directus.items('groups').readOne(id, {
        fields,
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        deep,
      });
    } else {
      const groups = await context.$directus.items('groups').readByQuery({
        limit: 1,
        filter: {
          translations: {
            // @ts-ignore This should be accepted. To be fixed in Directus SDK
            slug: { _eq: slug },
          },
        },
        fields,
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        deep,
      });

      directusGroup = groups.data?.[0];
    }

    if (!directusGroup) {
      throw new Error('Error when retrieving group');
    }

    return processGroup(directusGroup);
  };

  const getRole: CMSService['getRole'] = async (roleId: number) => {
    const rawRole = await context.$directus.items('roles').readOne(roleId, {
      fields: [
        'id',
        'translations.name',
        'translations.name_feminine',
        'translations.name_masculine',
        'translations.languages_code',
        'group.id',
        'group.translations.name',
        'group.translations.slug',
        'group.translations.languages_code',
        'holders.people_id.id',
        'holders.people_id.first_name',
        'holders.people_id.last_name',
        'holders.people_id.email',
        'holders.people_id.gender',
        'holders.people_id.portrait_square_head',
      ],
    });

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
    }

    const peopleResponse = await context.$directus.items('people').readByQuery({
      fields: [
        'id',
        'first_name',
        'last_name',
        'portrait_square_head',
        'gender',
        'email',
        'roles.main',
        'roles.roles_id.id',
        'roles.roles_id.translations.name',
        'roles.roles_id.translations.name_feminine',
        'roles.roles_id.translations.name_masculine',
        'roles.roles_id.group.id',
        'roles.roles_id.group.translations.name',
        'roles.roles_id.group.translations.slug',
        'roles.roles_id.group.translations.description',
      ],
      filter,
      deep: {
        roles: {
          // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
          roles_id: {
            translations: { _filter: { languages_code: { _eq: context.i18n.locale } } },
            group: { translations: { _filter: { languages_code: { _eq: context.i18n.locale } } } },
          },
        },
      },
    });

    if (!peopleResponse.data) {
      throw new Error('Error when retrieving people');
    }

    return peopleResponse.data.reduce((people, person) => {
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
    const statusFilter = statuses.reduce((filter, status): { status: string }[] => {
      return [
        ...filter,
        {
          status,
        },
      ];
    }, [] as { status: string }[]);

    const clubsResponse = await context.$directus.items('clubs').readByQuery({
      fields: ['id', 'name', 'name_full', 'name_sort', 'status', 'website', 'logo'],
      filter: {
        _or: statusFilter,
      },
      sort: ['name_sort'],
    });

    if (!clubsResponse.data) {
      throw new Error('Error when retrieving clubs');
    }

    return clubsResponse.data;
  };

  const getPressReleaseList: CMSService['getPressReleaseList'] = async ({ limit, page }) => {
    // Preparing the filter to retrieve the news
    const publishedFilter = {
      status: {
        _eq: 'published',
      },
    };

    const filter: any = { _and: [publishedFilter] };

    const pressReleaseResponse = await context.$directus.items('press_releases').readByQuery({
      meta: 'filter_count',
      limit,
      page,
      filter,
      fields: [
        'id',
        'date_created',
        'date_updated',
        'status',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.context',
      ],
      sort: ['-date_created'],
    });

    let totalPressReleaseEntries = 0;
    if (pressReleaseResponse?.meta?.filter_count) {
      totalPressReleaseEntries = pressReleaseResponse.meta.filter_count;
    }

    let pressReleaseList = [];
    if (!pressReleaseResponse?.data) {
      throw new Error('Error when retrieving press releases');
    }

    pressReleaseList = pressReleaseResponse.data.reduce((pressReleaseList, directusPressRelease) => {
      if (!directusPressRelease) {
        return pressReleaseList;
      }
      return [...pressReleaseList, processPressRelease(directusPressRelease)];
    }, [] as PressRelease[]);

    return {
      data: pressReleaseList,
      meta: {
        total: totalPressReleaseEntries,
      },
    };
  };

  const getPressRelease: CMSService['getPressRelease'] = async (pressReleaseId) => {
    const directusPressRelease = await context.$directus.items('press_releases').readOne(pressReleaseId, {
      fields: [
        'id',
        'date_created',
        'date_updated',
        'status',
        'translations.languages_code',
        'translations.slug',
        'translations.title',
        'translations.context',
        'translations.body',
      ],
    });

    if (!directusPressRelease) {
      throw new Error('Error when retrieving news');
    }

    return processPressRelease(directusPressRelease);
  };

  const processEvent = (directusEvent: PartialItem<DirectusEvent>, locale: string): CalendarEvent => {
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
    let response: OneItem<DirectusEvent>;
    try {
      response = await context.$directus.items('events').readOne(eventId, {
        fields: [
          'id',
          'translations.languages_code',
          'translations.name',
          'translations.description',
          'date_start',
          'time_start',
          'date_end',
          'time_end',
          'status',
          'venue.id',
          'venue.name',
          'venue.city',
          'venue.address',
          'venue_other',
          'image.id',
          'image.description',
          'url',
          'type',
        ],
      });
    } catch (error) {
      console.error('Error when retrieving event');
      throw error;
    }

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

    // Preparing the filter to retrieve the events
    const publishedFilter = {
      _and: [
        {
          status: {
            _neq: 'draft',
          },
        },
      ],
    };

    if (excludeCancelled) {
      publishedFilter._and.push({
        status: {
          _neq: 'cancelled',
        },
      });
    }

    let typeFilter: any;
    if (typeId) {
      typeFilter = {
        type: { id: { _eq: typeId } },
      };
    }

    let monthFilter: any;
    if (month) {
      monthFilter = {
        _and: [
          {
            date_start: {
              _gte: month,
            },
          },
          {
            date_start: {
              // It doesn't matter if not all months have 31 days. The filter still does the job as expected.
              _lte: month + '-31',
            },
          },
        ],
      };
    }

    let startDateBeforeFilter: any;
    if (startDateBefore) {
      startDateBeforeFilter = {
        date_start: {
          _lte: startDateBefore.toISOString(),
        },
      };
    }

    let startDateAfterFilter: any;
    if (startDateAfter) {
      startDateAfterFilter = {
        date_start: {
          _gte: startDateAfter.toISOString(),
        },
      };
    }

    let endDateBeforeFilter: any;
    if (endDateBefore) {
      endDateBeforeFilter = {
        date_end: {
          _lte: endDateBefore.toISOString(),
        },
      };
    }

    let endDateAfterFilter: any;
    if (endDateAfter) {
      endDateAfterFilter = {
        date_end: {
          _gte: endDateAfter.toISOString(),
        },
      };
    }

    let upcomingFilter: any;
    if (upcoming) {
      upcomingFilter = {
        date_start: {
          _gte: new Date().toISOString(),
        },
      };
    }

    const filter: any = { _and: [publishedFilter] };
    if (typeFilter) {
      filter._and.push(typeFilter);
    }
    if (monthFilter) {
      filter._and.push(monthFilter);
    }
    if (startDateBeforeFilter) {
      filter._and.push(startDateBeforeFilter);
    }
    if (startDateAfterFilter) {
      filter._and.push(startDateAfterFilter);
    }
    if (endDateBeforeFilter) {
      filter._and.push(endDateBeforeFilter);
    }
    if (endDateAfterFilter) {
      filter._and.push(endDateAfterFilter);
    }
    if (upcomingFilter) {
      filter._and.push(upcomingFilter);
    }

    const response = await context.$directus.items('events').readByQuery({
      meta: 'filter_count',
      limit,
      page: page || 1,
      filter,
      fields: [
        'id',
        'translations.languages_code',
        'translations.name',
        'translations.description',
        'date_start',
        'time_start',
        'date_end',
        'time_end',
        'status',
        'venue.id',
        'venue.name',
        'venue.city',
        'venue.address',
        'venue_other',
        'image.id',
        'image.description',
        'url',
        'type',
      ],
    });

    let totalEvents = 0;
    if (response?.meta?.filter_count) {
      totalEvents = response.meta.filter_count;
    }

    let events = [];
    if (!response?.data) {
      throw new Error('Error when retrieving events');
    }

    events = response.data.reduce((events, directusEvent) => {
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
        total: totalEvents,
      },
    };
  };

  const getTeam: CMSService['getTeam'] = async (teamSlug) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const teamResponse = await context.$directus.items('national_teams').readByQuery({
      limit: 1,
      filter: {
        translations: {
          // @ts-ignore This should be accepted. To be fixed in Directus SDK
          slug: { _eq: teamSlug },
        },
      },
      fields: [
        'gender',
        'team_photo.id',
        'team_photo.description',
        'team_photo_vertical_shift',
        'translations.languages_code',
        'translations.name',
        'translations.slug',
        'players.id',
        'players.first_name',
        'players.last_name',
        'players.number',
        'players.is_captain',
        'players.birth_year',
        'players.gender',
        'players.club.name',
        'players.positions.player_positions_id',
        'players.date_start',
        'players.date_end',
        'players.track_record',
        'players.portrait_square_head',
        'staff.roles_id.id',
        'staff.roles_id.translations.name',
        'staff.roles_id.translations.name_feminine',
        'staff.roles_id.translations.name_masculine',
        'staff.roles_id.holders.people_id.id',
        'staff.roles_id.holders.people_id.first_name',
        'staff.roles_id.holders.people_id.last_name',
        'staff.roles_id.holders.people_id.gender',
        'staff.roles_id.holders.people_id.email',
        'staff.roles_id.holders.people_id.portrait_square_head',
        'results.competition_id.year',
        'results.competition_id.logo',
        'results.competition_id.translations.languages_code',
        'results.competition_id.translations.name',
        'results.competition_id.translations.city',
        'results.competition_id.translations.country',
        'results.ranking',
        'nations_cup_results',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
        // @ts-ignore Bug with Directus SDK, it should accept roles_id here.
        staff: { roles_id: { translations: { _filter: { languages_code: { _eq: currentLocale } } } } },
        // TODO: uncomment the filter below once the filter on date fields is fixed https://github.com/directus/directus/issues/6494
        // players: {
        //   // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        //   _filter: {
        //     _or: [{ date_end: { _gte: context.$formatDate(new Date(), 'yyyy-MM-dd') } }, { date_end: { _null: true } }],
        //   },
        // },
      },
    });

    if (!teamResponse?.data) {
      throw new Error('Error when retrieving team');
    }

    const rawTeam = teamResponse.data[0];

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

  const getNationalTeamCompetition: CMSService['getNationalTeamCompetition'] = async (nationalTeamCompetitionId) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const competitionResponse = await context.$directus.items('national_team_competitions').readByQuery({
      limit: 1,
      filter: {
        id: nationalTeamCompetitionId,
      },
      fields: [
        'id',
        'logo',
        'year',
        'date_start',
        'date_end',
        'telegram_channel',
        'translations.language_code',
        'translations.name',
        'translations.city',
        'translations.country',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
      },
    });

    if (!competitionResponse?.data) {
      throw new Error('Error when retrieving national team competition');
    }

    const rawNationalTeamCompetition = competitionResponse.data[0];

    if (!rawNationalTeamCompetition) {
      throw new Error('No national team competition found');
    }

    const translations = getTranslatedFields(rawNationalTeamCompetition);

    if (
      !rawNationalTeamCompetition?.id ||
      !rawNationalTeamCompetition.year ||
      !translations?.name ||
      !translations.city ||
      !translations.country
    ) {
      throw new Error('National team competition is missing requested fields');
    }

    return {
      id: rawNationalTeamCompetition.id,
      logo: rawNationalTeamCompetition.logo,
      year: rawNationalTeamCompetition.year,
      date_start: rawNationalTeamCompetition.date_start,
      date_end: rawNationalTeamCompetition.date_end,
      name: translations.name,
      city: translations.city,
      country: translations.country,
      telegram_channel: rawNationalTeamCompetition.telegram_channel,
    };
  };

  const getNationalTeamCompetitionUpdates: CMSService['getNationalTeamCompetitionUpdates'] = async (
    nationalTeamCompetitionId,
    { limit, page }
  ) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const updatesResponse = await context.$directus.items('national_teams_competitions_updates').readByQuery({
      meta: 'filter_count',
      limit,
      page,
      filter: {
        competition: {
          id: nationalTeamCompetitionId,
        },
        status: 'published',
      },
      fields: [
        'id',
        'translations.body',
        'translations.languages_code',
        'image.id',
        'image.description',
        'date_created',
        'date_updated',
      ],
      sort: ['-date_created'],
    });

    let totalUpdates = 0;
    if (updatesResponse?.meta?.filter_count) {
      totalUpdates = updatesResponse.meta.filter_count;
    }

    if (!updatesResponse?.data) {
      throw new Error('Error when retrieving updates for national team competitions');
    }

    const updateList = updatesResponse.data.reduce((updates, rawUpdate) => {
      const updateTranslations = getTranslatedFields(rawUpdate, currentLocale);
      if (!rawUpdate.id || !rawUpdate.date_created || !updateTranslations?.body) {
        console.warn(`Update for national team competition with ID ${rawUpdate.id} is missing requested fields`);
        return updates;
      }

      return [
        ...updates,
        {
          id: rawUpdate.id,
          image: rawUpdate.image,
          body: updateTranslations.body,
          date_created: rawUpdate.date_created,
          date_updated: rawUpdate.date_updated,
        },
      ];
    }, [] as NationalTeamCompetitionUpdate[]);

    return {
      data: updateList,
      meta: {
        total: totalUpdates,
      },
    };
  };

  const getNationalTeamsForCompetition: CMSService['getNationalTeamsForCompetition'] = async (
    nationalTeamCompetitionId
  ) => {
    // We retrieve all the languages and show news in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const teamResponse = await context.$directus.items('national_team_competitions_teams').readByQuery({
      filter: {
        competition: {
          id: nationalTeamCompetitionId,
        },
      },
      fields: [
        'id',
        // 'team.translations.languages_code',
        'team.translations.name',
        'team.translations.slug',
        'players.national_team_players_id.id',
        'players.national_team_players_id.first_name',
        'players.national_team_players_id.last_name',
        'players.national_team_players_id.number',
        'players.national_team_players_id.is_captain',
        'players.national_team_players_id.birth_year',
        'players.national_team_players_id.gender',
        'players.national_team_players_id.club.name',
        'players.national_team_players_id.positions.player_positions_id',
        'players.national_team_players_id.date_start',
        'players.national_team_players_id.date_end',
        'players.national_team_players_id.track_record',
        'players.national_team_players_id.portrait_square_head',
        'coaches.people_id.id',
        'coaches.people_id.first_name',
        'coaches.people_id.last_name',
        'coaches.people_id.gender',
        'coaches.people_id.email',
        'coaches.people_id.portrait_square_head',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        team: { translation: { _filter: { language_code: { _eq: currentLocale } } } },
      },
    });

    if (!teamResponse?.data) {
      throw new Error('Error when retrieving national teams for competitions');
    }

    return teamResponse.data.map((rawTeam) => {
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
        players: processRawPlayers(rawTeam.players?.map((player) => player?.national_team_players_id)) as any[],
        coaches: rawTeam.coaches?.map((coach) => coach?.people_id) as any[],
      };
    });
  };

  const getSeasons: CMSService['getSeasons'] = async () => {
    const seasonsResponse = await context.$directus.items('seasons').readByQuery({
      fields: ['id', 'name', 'slug', 'date_start', 'date_end', 'leverade_id'],
      sort: ['-slug'],
    });

    if (!seasonsResponse?.data) {
      throw new Error('Error when retrieving seasons');
    }

    const seasons = seasonsResponse.data.reduce((seasons, season) => {
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
    const filter = {
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
    };

    const liveStreamsResponse = await context.$directus.items('live_streams').readByQuery({
      fields: [
        'id',
        'translations.languages_code',
        'translations.title',
        'url',
        'date_start',
        'date_end',
        'stream_start',
      ],
      sort: ['stream_start'],
      filter,
    });

    if (!liveStreamsResponse?.data) {
      throw new Error('Error when retrieving seasons');
    }

    // We retrieve all the languages and show text in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    const liveStreams = liveStreamsResponse.data.reduce((liveStreams, liveStream) => {
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

  const getNationalCompetition: CMSService['getNationalCompetition'] = async (competitionSlug) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;
    const response = await context.$directus.items('national_competitions').readByQuery({
      limit: 1,
      filter: {
        translations: {
          // @ts-ignore This should be accepted. To be fixed in Directus SDK
          slug: { _eq: competitionSlug },
        },
      },
      fields: [
        'id',
        'translations.languages_code',
        'translations.name',
        'translations.slug',
        'editions.season.id',
        'editions.season.name',
        'editions.season.slug',
        'editions.season.leverade_id',
        'editions.leverade_id',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        translations: { _filter: { languages_code: { _eq: currentLocale } } },
      },
    });

    if (!response?.data) {
      throw new Error('Error when retrieving competition');
    }

    const rawCompetition = response.data[0];

    if (!rawCompetition || !rawCompetition.id) {
      throw new Error('No competition found');
    }
    const translatedFields = getTranslatedFields(rawCompetition);

    if (!translatedFields?.name || !translatedFields?.slug) {
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

  const getNationalCompetitionEditions: CMSService['getNationalCompetitionEditions'] = async ({
    competitionSlug,
    seasonSlug,
    leveradeIds,
  }) => {
    // We retrieve all the languages and show data in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    let filter: Filter<DirectusNationalCompetitionEdition> = {};

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
        filter._and.push({
          competition: {
            translations: {
              // @ts-ignore This should be accepted. To be fixed in Directus SDK
              slug: { _eq: competitionSlug },
            },
          },
        });
      }
      if (seasonSlug) {
        filter._and.push({
          season: {
            slug: { _eq: seasonSlug },
          },
        });
      }
    }

    const response = await context.$directus.items('national_competition_editions').readByQuery({
      filter,
      fields: [
        'id',
        'season.id',
        'season.name',
        'season.slug',
        'season.date_start',
        'season.date_end',
        'season.leverade_id',
        'competition.id',
        'competition.translations.name',
        'competition.translations.slug',
        'leverade_id',
      ],
      deep: {
        // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
        competition: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
      },
    });

    if (!response?.data) {
      throw new Error('Error when retrieving competition edition');
    }

    return response.data.reduce((editions, rawEdition) => {
      if (!rawEdition.competition) {
        return editions;
      }

      const translatedCompetitionFields = getTranslatedFields(rawEdition.competition);

      if (
        !rawEdition.id ||
        !rawEdition.season?.id ||
        !rawEdition.season?.name ||
        !rawEdition.season?.slug ||
        !rawEdition.season?.date_start ||
        !rawEdition.season?.date_end ||
        !rawEdition.season?.leverade_id ||
        !rawEdition.competition.id ||
        !translatedCompetitionFields?.name ||
        !translatedCompetitionFields?.slug ||
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
          competition: {
            id: rawEdition.competition.id,
            name: translatedCompetitionFields?.name,
            slug: translatedCompetitionFields?.slug,
          },
          leverade_id: rawEdition.leverade_id,
        },
      ];
    }, [] as NationalCompetitionEdition[]);
  };

  const getMatchAdditionalData: CMSService['getMatchAdditionalData'] = async (leveradeId) => {
    const response = await context.$directus.items('match_additional_data').readByQuery({
      limit: 1,
      filter: {
        leverade_id: leveradeId,
      },
      fields: ['id', 'leverade_id', 'flickr_photoset_id'],
    });

    if (!response?.data) {
      throw new Error('Could not retrieve match additional data');
    }

    if (!response.data.length) {
      // No additional data for this match
      return null;
    }

    const rawData = response.data[0];

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
    const tchoukupResponse = await context.$directus.items('tchoukup').readByQuery({
      meta: 'filter_count',
      limit,
      page,
      fields: [
        'id',
        'number',
        'releaseDate',
        'cover.id',
        'cover.description',
        'file',
        'file.id',
        'file.type',
        'file.filesize',
        'file.filename_download',
      ],
      sort: ['-releaseDate'],
    });

    let totalIssues = 0;
    if (tchoukupResponse?.meta?.filter_count) {
      totalIssues = tchoukupResponse.meta.filter_count;
    }

    let tchoukups = [];
    if (!tchoukupResponse?.data) {
      throw new Error('Error when retrieving Tchoukups');
    }

    tchoukups = tchoukupResponse.data.reduce((news, directusTchoukup) => {
      if (!directusTchoukup) {
        return news;
      }

      if (!directusTchoukup.id || !directusTchoukup.number || !directusTchoukup.file) {
        console.warn(`Tchoukup entry with ID ${directusTchoukup.id} is missing requested fields`);
        return news;
      }

      const tchoukupIssue: Tchoukup = {
        id: directusTchoukup.id,
        number: directusTchoukup.number,
        releaseDate: directusTchoukup.releaseDate,
        file: directusTchoukup.file as DirectusFile,
      };

      if (directusTchoukup.cover && directusTchoukup.cover.id) {
        tchoukupIssue.cover = {
          id: directusTchoukup.cover.id,
          description: directusTchoukup.cover.description || '',
        };
      }

      return [...news, tchoukupIssue];
    }, [] as Tchoukup[]);

    return {
      data: tchoukups,
      meta: {
        total: totalIssues,
      },
    };
  };

  const getResourceTypes: CMSService['getResourceTypes'] = async () => {
    const currentLocale = context.i18n.locale;
    const response = await context.$directus.items('resource_types').readByQuery({
      fields: ['id', 'translations.name'],
      // @ts-ignore Bug with Directus SDK, which expects `filter` instead of `_filter`. It doesn't work with `filter`.
      deep: { translations: { _filter: { languages_code: { _eq: currentLocale } } } },
    });

    if (!response.data) {
      throw new Error('Error when retrieving resource types');
    }

    const resourceTypes = response.data.reduce((resourceTypes, resourceType) => {
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

  const searchResources: CMSService['searchResources'] = async (searchTerm, domainId, typeId) => {
    // We retrieve all the languages and show resources in fallback locale if not available in current locale
    const currentLocale = context.i18n.locale;

    // Type should be Filter<DirectusResourceType>, but there is a bug in the Directus SDK.
    // We use any as a workaround until the _and is properly recognised. See https://github.com/directus/directus/issues/7475
    const filter: any = {
      _and: [
        {
          status: { _eq: 'visible' },
        },
      ],
    };

    if (searchTerm) {
      // We use the filter because the search capability of Directus only work on root level items, not relations
      filter._and.push({
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
      filter._and.push({
        domains: { domains_id: { _eq: domainId } },
      });
    }

    if (typeId) {
      filter._and.push({
        type: { _eq: typeId },
      });
    }

    const response = await context.$directus.items('resources').readByQuery({
      filter,
      fields: [
        'id',
        'date',
        'type',
        'domains.domains_id',
        'translations.languages_code',
        'translations.name',
        'translations.file.id',
        'translations.file.type',
        'translations.file.filesize',
        'translations.file.filename_download',
        'translations.link',
      ],
    });

    if (!response.data) {
      throw new Error('Error when retrieving resources');
    }

    return response.data
      .reduce((resources, resource) => {
        if (!resource) {
          return resources;
        }
        const translatedFields = getTranslatedFields(resource, currentLocale);

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
      .sort((resourceA, resourceB) => resourceA.name.localeCompare(resourceB.name));
  };

  inject('cmsService', {
    getPage,
    getText,
    getDomains,
    getNews,
    getOneNews,
    getEvent,
    getGroups,
    getGroup,
    getRole,
    getStaff,
    getClubs,
    getPressReleaseList,
    getPressRelease,
    getEvents,
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
  });
};

export default cmsService;
