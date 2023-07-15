<template>
  <article class="c-national-team-competition-update">
    <time :datetime="update.date_created" class="c-national-team-competition-update__time">
      {{ formattedDate }}
    </time>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p class="c-national-team-competition-update__body" v-html="formattedBody"></p>
    <img
      v-if="update.image"
      class="c-national-team-competition-update__image"
      :alt="update.image.description"
      :src="imageFallbackSrc"
      :srcset="imageSrcSet"
      sizes="(min-width: 800px}) 800px, 96vw"
    />
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { differenceInDays } from 'date-fns';
import linkifyString from 'linkify-string';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';
import { NationalTeamCompetitionUpdate } from '~/components/national-teams/st-national-teams.prop';

export default Vue.extend({
  props: {
    update: {
      type: Object as PropType<NationalTeamCompetitionUpdate>,
      required: true,
    },
  },
  data() {
    return {
      imgTagSizes: '',
    };
  },
  computed: {
    createdDate(): Date {
      return new Date(this.update.date_created);
    },
    formattedDate(): string {
      if (differenceInDays(new Date(), this.createdDate) < 1) {
        return this.$formatDateDistanceToNow(new Date(this.update.date_created));
      } else {
        return this.$formatDate(new Date(this.update.date_created), 'PPP');
      }
    },
    formattedBody(): string {
      return linkifyString(this.update.body);
    },
    imageFallbackSrc(): string {
      if (!this.update.image) {
        return '';
      }
      return getAssetURL(this.$config.cmsURL, this.update.image.id, {
        width: 1600,
        withoutEnlargement: 'true',
      });
    },
    imageSrcSet(): string {
      if (!this.update.image) {
        return '';
      }
      return getAssetSrcSet(this.$config.cmsURL, this.update.image.id, {
        widths: [400, 800, 1600],
      });
    },
  },
});
</script>

<style scoped>
.c-national-team-competition-update__time {
  display: block;
  font-size: 0.8em;
  color: var(--st-color-text-lighter);
}

.c-national-team-competition-update__time::first-letter {
  text-transform: uppercase;
}

.c-national-team-competition-update__body {
  margin-top: var(--st-length-spacing-xxs);
  white-space: pre-wrap;
}

.c-national-team-competition-update__image {
  display: block;
  width: 100%;
  margin-top: var(--st-length-spacing-xs);
  margin-bottom: 0;
}
</style>
