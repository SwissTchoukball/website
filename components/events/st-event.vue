<template>
  <article class="c-event" :class="{ 'c-event--no-image': !hasImage, 'c-event--cancelled': isCancelled }">
    <img
      v-if="hasImage"
      class="c-event__image"
      :alt="mainImageDescription"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="`(min-width: 1400px) 1400px, 96vw`"
    />
    <st-event-date
      :start-date="event.date_start"
      :end-date="event.date_end"
      :show-year="showYear"
      :cancelled="isCancelled"
    />
    <div class="c-event__main">
      <header class="c-event__header">
        <h3 class="t-headline-2 c-event__name" :class="{ 'c-event__name--cancelled': isCancelled }">
          <nuxt-link :to="titleTo" class="c-event__name-link">{{ event.name }}</nuxt-link>
          <st-cancelled-label v-if="isCancelled" class="c-event__cancelled-label" />
        </h3>
        <nuxt-link
          v-if="eventType && eventType.name"
          :to="
            localePath({ name: 'events-slug', params: { slug: `${eventType.id}-${slugify(eventType.name_plural)}` } })
          "
          class="c-event__type"
        >
          {{ eventType.name }}
        </nuxt-link>
      </header>
      <st-link-action v-if="!areInfoVisible" class="c-event__show-info-action" @click="showInfo">
        {{ $t('events.showInfo') }}
      </st-link-action>
      <template v-else>
        <section
          v-if="event.description"
          class="directus-formatted-content c-event__description"
          v-html="event.description"
        ></section>
        <section class="c-event__details">
          <div class="c-event__venue-and-time">
            <div
              v-if="event.venue"
              class="c-event__venue"
              :class="{ 'c-event__venue--with-address': event.venue.address }"
            >
              <font-awesome-icon icon="location-dot" class="c-event__icon" />
              <component :is="event.venue.address ? 'details' : 'div'" class="c-event__venue-name-and-address">
                <component :is="event.venue.address ? 'summary' : 'span'" class="u-unstyled-button c-event__venue-name">
                  {{ event.venue.name }}<template v-if="event.venue.city">, {{ event.venue.city }}</template>
                </component>
                <!-- We first only show the address, if someone only wants to see in which city is the venue. -->
                <!-- Then clicking on the address opens the map. -->
                <a :href="mapsUrl" class="c-event__address">{{ event.venue.address }}</a>
              </component>
            </div>
            <time :datetime="event.date_start.toISOString()" class="c-event__time">
              <font-awesome-icon icon="clock" class="c-event__icon" />
              <span>{{ time }}</span>
            </time>
          </div>
          <st-button v-if="event.url" :href="event.url" primary class="c-event__link">
            {{ $t('events.moreInfo') }}
          </st-button>
        </section>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '~/plugins/08.cms-service';
import { getAssetSrcSet, getAssetURL } from '~/plugins/06.directus';
import stEventDate from '~/components/events/st-event-date.vue';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const localePath = useLocalePath();
const { t } = useI18n();
const { $formatDate } = useNuxtApp();
const { slugify } = useSlugify();
const eventsStore = useEventsStore();

const props = defineProps({
  event: {
    type: Object as PropType<CalendarEvent>,
    required: true,
  },
  showYear: Boolean,
});

const areInfoVisible = ref(true);

const titleTo = computed<string>(() => {
  return localePath({
    name: 'event-slug',
    params: { slug: `${props.event.id}-${slugify(props.event.name)}` },
  });
});
const time = computed<string>(() => {
  if (props.event.isFullDay) {
    return t('events.fullDay').toString();
  }
  let time = $formatDate(props.event.date_start, 'HH:mm');
  if (props.event.showEndTime) {
    time += ` - ${$formatDate(props.event.date_end, 'HH:mm')}`;
  }
  return time;
});
const isCancelled = computed<boolean>(() => {
  return props.event.status === 'cancelled';
});
const eventTypes = computed<EventTypes | undefined>(() => {
  return eventsStore.eventTypes;
});
const eventType = computed<EventType | null>(() => {
  if (eventTypes.value && props.event.type) {
    return eventTypes.value[props.event.type];
  } else {
    return null;
  }
});
const hasImage = computed<boolean>(() => {
  return !!(props.event.image || eventType.value?.image);
});
const mainImageFallbackSrc = computed<string>(() => {
  if (props.event.image) {
    return getAssetURL(runtimeConfig.public.cmsURL, props.event.image.id, {
      width: appConfig.keyVisualSizes[0],
    });
  } else if (eventType.value?.image) {
    return getAssetURL(runtimeConfig.public.cmsURL, eventType.value.image.id, {
      width: appConfig.keyVisualSizes[0],
    });
  }
  return '';
});
const mainImageSrcSet = computed<string>(() => {
  if (props.event.image) {
    return getAssetSrcSet(runtimeConfig.public.cmsURL, props.event.image.id, {
      widths: appConfig.keyVisualSizes,
    });
  } else if (eventType.value?.image) {
    return getAssetSrcSet(runtimeConfig.public.cmsURL, eventType.value.image.id, {
      widths: appConfig.keyVisualSizes,
    });
  }
  return '';
});
const mainImageDescription = computed<string>(() => {
  return props.event?.image?.description || eventType.value?.image?.description || '';
});
const mapsUrl = computed<string | undefined>(() => {
  if (!props.event.venue) {
    return undefined;
  }
  // This link will fallback to Google Maps if Apple Maps is not available
  return `//maps.apple.com/?q=${props.event.venue.address?.replace('\n', ', ')}`;
});

const showInfo = () => {
  areInfoVisible.value = true;
};

if (isCancelled.value) {
  areInfoVisible.value = false;
}
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-event {
  display: flex;
  flex-direction: column;
  padding: var(--st-length-spacing-xs);
  position: relative;
}

.c-event--no-image {
  background-color: var(--st-color-event-background);
}

.c-event__image {
  position: absolute;
  inset: 0;
  z-index: -1;
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: 0.15;
  pointer-events: none;
}

.c-event__name {
  padding-top: var(--st-length-spacing-xs);
}

.c-event__name-link {
  color: var(--st-color-text);
  text-decoration: none;
}

.c-event__main {
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

.c-event__cancelled-label {
  margin-left: var(--st-length-spacing-xxs);
  transform: translateY(-0.2rem);
}

.c-event__show-info-action {
  margin-top: var(--st-length-spacing-xs);
}

.c-event__details {
  display: flex;
  flex-direction: column;
}

.c-event__type {
  color: var(--st-color-event-type);
  font-weight: bold;
  font-size: 0.9em;
  padding-top: var(--st-length-spacing-xxs);
  flex-shrink: 0;
}

.c-event__description {
  padding: var(--st-length-spacing-xs) 0;
  font-weight: 500;
}

.c-event__description:deep(p) {
  margin-left: 0;
}

.c-event__venue,
.c-event__time {
  padding-top: var(--st-length-spacing-xs);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.c-event__venue {
  align-items: flex-start;
}

.c-event__venue--with-address .c-event__venue-name {
  cursor: pointer;
  list-style: none;
  position: relative;
  margin-left: var(--st-length-spacing-xs);
}

.c-event__venue--with-address .c-event__venue-name::-webkit-details-marker {
  display: none;
}

.c-event__venue--with-address .c-event__venue-name::before {
  content: '\25B6';
  font-size: 0.6em;
  color: var(--st-color-event-address-toggle-marker);
  position: absolute;
  top: 0.2rem;
  left: calc(-1 * var(--st-length-spacing-xs));
  transform: rotate(0);
  transform-origin: 0.2rem 50%;
  transition: 0.25s transform ease;
}

.c-event__venue-name-and-address[open] > .c-event__venue-name::before {
  transform: rotate(90deg);
}

.c-event__address {
  white-space: pre-line;
  margin-left: var(--st-length-spacing-xs);
  display: inline-block;
}

.c-event__icon {
  width: 1rem;
  color: var(--st-color-event-icon);
  margin-right: var(--st-length-spacing-xxs);
}

.c-event__link {
  align-self: flex-end;
  margin-top: var(--st-length-spacing-xs);
}

.c-event--cancelled .c-event__name-link,
.c-event--cancelled .c-event__venue,
.c-event--cancelled .c-event__time {
  text-decoration: line-through;
  color: var(--st-color-event-foreground-cancelled);
}

.c-event--cancelled .c-event__icon {
  color: var(--st-color-event-foreground-cancelled);
}

@media (--sm-and-up) {
  .c-event {
    flex-direction: row;
  }

  .c-event__main {
    position: relative;
  }

  .c-event__header,
  .c-event__details {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .c-event__details {
    align-items: flex-end;
  }

  .c-event__type {
    padding-top: 0;
    padding-left: var(--st-length-spacing-xs);
    text-decoration: none;
  }

  .c-event__name {
    padding-top: 0;
  }

  .c-event__link {
    flex-shrink: 0;
  }
}

/* Transitions */

/* Enter and leave animations can use different
   durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-enter {
  transform: translateX(50px);
  opacity: 0;
}

@media (--md-and-up) {
  .c-event {
    padding: var(--st-length-spacing-s);
  }
}

@media (--lg-and-up) {
  .c-event__description {
    padding: var(--st-length-spacing-s) 0;
  }

  .c-event__venue,
  .c-event__time {
    padding-top: var(--st-length-spacing-s);
  }

  .c-event__icon {
    font-size: 1.5rem;
    width: 1.5rem;
    margin-right: var(--st-length-spacing-xs);
  }
}
</style>
