<template>
  <div class="c-resource">
    <fa-icon :icon="iconName" class="c-resource__icon" />
    <div class="c-resource__name-details">
      <a class="c-resource__name" :href="href" :download="download">{{ resource.name }}</a>
      <div class="c-resource__details">
        <span v-if="fileType" class="c-resource__file_type">{{ fileType }}</span>
        <span v-if="formattedFileSize" class="c-resource__file-size">{{ formattedFileSize }}</span>
        <span v-if="date" class="c-resource__date">{{ date }}</span>
      </div>
    </div>
    <!-- <pre>{{ resource }}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { TranslateResult } from 'vue-i18n';
import Resource from '~/models/resource.model';
import { humanFileSize } from '~/utils/utils';

export default Vue.extend({
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true,
    },
  },
  computed: {
    href(): string | undefined {
      if (this.resource.file) {
        return `${this.$config.cmsURL}/assets/${this.resource.file.id}?download`;
      } else if (this.resource.link) {
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
      if (!this.resource.file) {
        return;
      }
      return humanFileSize(this.resource.file.filesize, 2, this.$i18n.locale);
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
      } else if (this.resource.link) {
        return this.$t('resources.link');
      }
      return this.$t('resources.missing');
    },
  },
});
</script>

<style scoped>
.c-resource {
  display: flex;
  align-items: center;
}

.c-resource__icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.2rem;
  margin-right: var(--st-length-spacing-xxs);
  color: var(--st-color-resource-icon);
  flex-shrink: 0;
}

.c-resource__name {
  color: var(--st-color-link);
  display: inline-block;
}

.c-resource__details {
  display: flex;
  margin-top: var(--st-length-spacing-xxs);
  color: var(--st-color-resource-details);
  font-size: 0.8em;
}

.c-resource__details > *::after {
  content: '\2022';
  display: inline-block;
  padding: 0 var(--st-length-spacing-xxs);
}

.c-resource__details > *:last-child::after {
  display: none;
}
</style>
