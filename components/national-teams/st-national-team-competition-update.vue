<template>
  <article
    class="c-national-team-competition-update"
    :class="{ 'c-national-team-competition-update--key': update.is_key }"
  >
    <div class="c-national-team-competition-update__header">
      <time :datetime="update.date_created" class="c-national-team-competition-update__time">
        {{ formattedDate }}
      </time>
      <span v-if="update.teams.length">·</span>
      <ul class="u-unstyled-list c-national-team-competition-update__teams">
        <li v-for="team of update.teams" :key="team.name" class="c-national-team-competition-update__team">
          {{ team.name }}
        </li>
      </ul>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p class="c-national-team-competition-update__body" v-html="formattedBody"></p>
    <img
      v-if="update.image"
      class="c-national-team-competition-update__image"
      :alt="update.image.description || undefined"
      :src="imageFallbackSrc"
      :srcset="imageSrcSet"
      sizes="(min-width: 800px}) 800px, 96vw"
    />
  </article>
</template>

<script setup lang="ts">
import { differenceInDays } from 'date-fns';
import linkifyString from 'linkify-string';
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';
import type { NationalTeamCompetitionUpdate } from '~/components/national-teams/st-national-teams.prop';

const { $formatDateDistanceToNow, $formatDate } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();

const props = defineProps({
  update: {
    type: Object as PropType<NationalTeamCompetitionUpdate>,
    required: true,
  },
});

const createdDate = computed<Date>(() => {
  return new Date(props.update.date_created);
});

const formattedDate = computed<string>(() => {
  if (differenceInDays(new Date(), createdDate.value) < 1) {
    return $formatDateDistanceToNow(new Date(props.update.date_created));
  } else {
    return $formatDate(new Date(props.update.date_created), 'PPP');
  }
});

const formattedBody = computed<string>(() => {
  return linkifyString(props.update.body);
});

const imageFallbackSrc = computed<string>(() => {
  if (!props.update.image) {
    return '';
  }
  return getAssetURL(runtimeConfig.public.cmsURL, props.update.image.id, {
    width: 1600,
    withoutEnlargement: 'true',
  });
});

const imageSrcSet = computed<string>(() => {
  if (!props.update.image) {
    return '';
  }
  return getAssetSrcSet(runtimeConfig.public.cmsURL, props.update.image.id, {
    widths: [400, 800, 1600],
  });
});
</script>

<style scoped>
.c-national-team-competition-update--key {
  font-weight: bold;
}

.c-national-team-competition-update__header {
  display: flex;
  gap: var(--st-length-spacing-xxs);
  font-size: 0.8em;
  color: var(--st-color-text-lighter);
}

.c-national-team-competition-update__teams,
.c-national-team-competition-update__time,
.c-national-team-competition-update__team {
  display: flex;
}

.c-national-team-competition-update__teams {
  flex-wrap: wrap;
}

.c-national-team-competition-update__time {
  white-space: nowrap;
}

.c-national-team-competition-update__team::after {
  content: ', ';
  margin-right: 0.25rem;
}

.c-national-team-competition-update__team:last-child::after {
  content: '';
}

.c-national-team-competition-update--key .c-national-team-competition-update__header {
  color: var(--st-color-red-swiss-tchoukball);
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
