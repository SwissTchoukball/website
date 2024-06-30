import type { Resource, Role } from '~/plugins/08.cms-service';

export function useCatchAll() {
  const route = useRoute();
  const { $cmsService } = useNuxtApp();
  const { locale, defaultLocale } = useI18n();

  const title = ref('');
  const body = ref('');
  const keyRoles = ref<Role[]>([]);
  const resources = ref<Resource[]>([]);

  const fetchPage = async () => {
    let splitPath = route.path.match('^/.{2}(/.*)$');
    if (!splitPath) {
      // This means there's no match, and thus no language prefix. This can happen with the default language.
      splitPath = [route.path, route.path];
    }
    let pagePath;
    if (splitPath?.length === 2) {
      pagePath = splitPath[1];
    } else {
      throw createError({ statusMessage: 'The given path cannot be processed', fatal: true });
    }

    try {
      const page = await $cmsService.getPage({ pagePath });

      if (page.path !== pagePath) {
        // We are likely in a situation where the page was requested in a specific language,
        // but with the path in another language.
        // This can notably happen when using the language switcher.
        // We just redirect to fix the path.
        let pathLocale = `/${locale.value}`;
        // The current strategy doesn't put a prefix for the default language
        if (locale.value === defaultLocale) {
          pathLocale = '';
        }
        navigateTo(`${pathLocale}${page.path}`);
      }

      title.value = page.title;
      body.value = page.body;
      keyRoles.value = page.key_roles;
      resources.value = page.resources;
    } catch (err: any) {
      switch (err.message) {
        case 'pageNotFound':
          throw createError({ statusCode: 404, message: `Could not find page for ${pagePath}`, fatal: true });
        case 'noData':
          console.info('No data either in the requested locale or the fallback locale.');
          break;
        default:
          throw createError({ message: `Error when retrieving simple page: ${err}`, fatal: true });
      }
    }
  };

  return {
    fetchPage,
    title,
    body,
    keyRoles,
    resources,
  };
}
