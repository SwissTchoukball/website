import { defineComponent, type PropType } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Domain, Resource } from '~/plugins/08.cms-service';
import { humanFileSize } from '~/utils/utils';

export default defineComponent({
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true,
    },
  },
  computed: {
    href(): string | undefined {
      if (this.resource.file) {
        return `${this.$config.cmsURL}/assets/${this.resource.file.id}`;
      } else if (this.resource?.link) {
        return this.resource.link;
      } else {
        return '#';
      }
    },
    download(): string | null {
      if (!this.resource.file) {
        return null;
      }
      return this.resource.file.filename_download;
    },
    date(): string | undefined {
      if (this.resource.date) {
        return this.$formatDate(new Date(this.resource.date), 'dd.MM.yyyy');
      }
      return undefined;
    },
    formattedFileSize(): string | undefined {
      if (!this.resource.file?.filesize) {
        return;
      }
      return humanFileSize(+this.resource.file.filesize, 2, this.$i18n.locale);
    },
    fileName(): string {
      if (this.resource?.name) {
        return this.resource.name;
      }
      return this.$t('resources.missing').toString();
    },
    iconName(): string {
      if (this.resource.file) {
        switch (this.resource.file.type) {
          case 'application/pdf':
            return 'file-pdf';
          case 'application/zip':
            return 'file-zipper';
          default:
            return 'file';
        }
      } else if (this.resource.link) {
        return 'link';
      }
      return 'question';
    },
    fileType(): TranslateResult {
      if (this.resource.file) {
        switch (this.resource.file.type) {
          case 'application/pdf':
            return this.$t('resources.fileType.pdf');
          case 'application/zip':
            return this.$t('resources.fileType.zip');
          default:
            return this.$t('resources.fileType.other');
        }
      } else if (this.resource?.link) {
        return this.$t('resources.link');
      }
      return this.$t('resources.missing');
    },
    domains(): Domain[] {
      if (!this.resource) {
        return [];
      }
      return this.resource.domain_ids.map((domainId) => this.$store.getters.getDomainById(domainId));
    },
  },
});
