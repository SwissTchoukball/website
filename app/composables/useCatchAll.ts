import type { SimplePage } from '~/plugins/08.cms-service';

export function useCatchAll() {
  const route = useRoute();
  const { $cmsService } = useNuxtApp();
  const { locale, fallbackLocale } = useI18n();

  const page = ref<SimplePage>();

  const fetchPage = async () => {
    let splitPath = route.path.match('^/.{2}(/.*)$');
    if (!splitPath) {
      // This means there's no match, and thus no language prefix. This can happen with the default language.
      splitPath = [route.path, route.path];
    }
    let pagePath;
    if (splitPath?.length === 2) {
      pagePath = splitPath[1]!;
    } else {
      throw createError({ statusMessage: 'The given path cannot be processed', fatal: true });
    }

    page.value = await $cmsService.getPage({ pagePath });

    if (page.value.path !== pagePath) {
      // We are likely in a situation where the page was requested in a specific language,
      // but with the path in another language.
      // This can notably happen when using the language switcher.
      // We just redirect to fix the path.
      let pathLocale = `/${locale.value}`;
      // The current strategy doesn't put a prefix for the default language
      if (locale.value === fallbackLocale.value) {
        pathLocale = '';
      }
      navigateTo(`${pathLocale}${page.value.path}`);
    }
  };

  return {
    fetchPage,
    page,
  };
}
