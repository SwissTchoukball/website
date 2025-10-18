import type { Domain, Resource } from '~/plugins/08.cms-service';
import { humanFileSize } from '~/utils/utils';
import { useDomains } from '~/composables/useDomains';

export function useResource(resource: Resource) {
  const runtimeConfig = useRuntimeConfig();
  const { locale, t } = useI18n();
  const { $formatDate } = useNuxtApp();
  const { getDomainsFromList } = useDomains();

  const href = computed<string | undefined>(() => {
    if (resource.file) {
      return `${runtimeConfig.public.cmsURL}/assets/${resource.file.id}`;
    } else if (resource?.link) {
      return resource.link;
    } else {
      return '#';
    }
  });

  const download = computed<string | null>(() => {
    if (!resource.file) {
      return null;
    }
    return resource.file.filename_download;
  });

  const date = computed<string | undefined>(() => {
    if (resource.date) {
      return $formatDate(new Date(resource.date), 'dd.MM.yyyy');
    }
    return undefined;
  });

  const formattedFileSize = computed<string | undefined>(() => {
    if (!resource.file?.filesize) {
      return;
    }
    return humanFileSize(+resource.file.filesize, 2, locale.value);
  });

  const fileName = computed<string>(() => {
    if (resource?.name) {
      return resource.name;
    }
    return t('resources.missing').toString();
  });

  const iconName = computed<string>(() => {
    if (resource.file) {
      switch (resource.file.type) {
        case 'application/pdf':
          return 'file-pdf';
        case 'application/zip':
          return 'file-zipper';
        default:
          return 'file';
      }
    } else if (resource.link) {
      return 'link';
    }
    return 'question';
  });

  const fileType = computed<string>(() => {
    if (resource.file) {
      switch (resource.file.type) {
        case 'application/pdf':
          return t('resources.fileType.pdf');
        case 'application/zip':
          return t('resources.fileType.zip');
        default:
          return t('resources.fileType.other');
      }
    } else if (resource?.link) {
      return t('resources.link');
    }
    return t('resources.missing');
  });

  const domains = computed<Domain[]>(() => {
    if (!resource) {
      return [];
    }

    return getDomainsFromList(resource.domain_ids);
  });

  return {
    href,
    download,
    date,
    formattedFileSize,
    fileName,
    iconName,
    fileType,
    domains,
  };
}
