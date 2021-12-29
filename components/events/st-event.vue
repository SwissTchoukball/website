<template>
  <article class="c-event" :class="{ 'c-event--no-image': !event.image, 'c-event--cancelled': isCancelled }">
    <img
      v-if="event.image"
      class="c-event__image"
      :alt="event.image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="`(min-width: 1400px) 1400px, 96vw`"
    />
    <st-event-date :start-date="event.date_start" :end-date="event.date_end" :cancelled="isCancelled" />
    <div class="c-event__main">
      <header class="c-event__header">
        <h3 class="t-headline-2 c-event__name" :class="{ 'c-event__name--cancelled': isCancelled }">
          <nuxt-link :to="titleTo" class="c-event__name-link">{{ event.name }}</nuxt-link>
          <div v-if="isCancelled" class="c-event__cancelled-label">{{ $t('events.cancelled') }}</div>
        </h3>
        <div v-if="eventTypeName" class="c-event__type">{{ eventTypeName }}</div>
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
              <fa-icon icon="map-marker-alt" class="c-event__icon" />
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
              <fa-icon icon="clock" class="c-event__icon" />
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

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Location } from 'vue-router';
import { Store } from 'vuex';
import { CalendarEvent } from '~/plugins/cms-service';
import { EventTypes, RootState } from '~/store/state';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';
import stEventDate from '~/components/events/st-event-date.vue';

export default Vue.extend({
  components: { stEventDate },
  props: {
    event: {
      type: Object as PropType<CalendarEvent>,
      required: true,
    },
  },
  data() {
    return {
      areInfoVisible: true,
      isAddressVisible: false,
    };
  },
  computed: {
    titleTo(): Location {
      const location: Location = { hash: `event-${this.event.id}` };

      if (this.$route.query.month || this.$route.query.year) {
        location.query = {};
        if (this.$route.query.month) {
          location.query.month = this.$route.query.month.toString();
        }
        if (this.$route.query.year) {
          location.query.year = this.$route.query.year.toString();
        }
      }

      return location;
    },
    time(): string {
      if (this.event.isFullDay) {
        return this.$t('events.fullDay').toString();
      }
      let time = this.$formatDate(this.event.date_start, 'HH:mm');
      if (this.event.showEndTime) {
        time += ` - ${this.$formatDate(this.event.date_end, 'HH:mm')}`;
      }
      return time;
    },
    isCancelled(): boolean {
      return this.event.status === 'cancelled';
    },
    eventTypes(): EventTypes | undefined {
      return (this.$store as Store<RootState>).state.eventTypes;
    },
    eventTypeName(): string | null {
      if (this.eventTypes && this.event.type) {
        return this.eventTypes[this.event.type].name;
      } else {
        return null;
      }
    },
    mainImageFallbackSrc(): string {
      if (!this.event.image) {
        return '';
      }
      return getAssetURL(this.$config.cmsURL, this.event.image.id, {
        width: this.$config.keyVisualSizes[0],
      });
    },
    mainImageSrcSet(): string {
      if (!this.event.image) {
        return '';
      }
      return getAssetSrcSet(this.$config.cmsURL, this.event.image.id, {
        widths: this.$config.keyVisualSizes,
      });
    },
    mapsUrl(): string | null {
      if (!this.event.venue) {
        return null;
      }
      // This link will fallback to Google Maps if Apple Maps is not available
      return `//maps.apple.com/?q=${this.event.venue.address?.replace('\n', ', ')}`;
    },
  },
  created() {
    if (this.isCancelled) {
      this.areInfoVisible = false;
    }
  },
  methods: {
    showInfo() {
      this.areInfoVisible = true;
    },
    toggleAddressVisibility() {
      if (this.event.venue?.address) {
        this.isAddressVisible = !this.isAddressVisible;
      }
    },
  },
});
</script>

<style scoped>
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
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
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
  display: inline-block;
  font-size: 0.6em;
  color: var(--st-color-event-cancelled-label);
  text-transform: uppercase;
  font-weight: bold;
  border: 0.2rem solid var(--st-color-event-cancelled-label);
  border-radius: 0.5em;
  padding: calc(var(--st-length-spacing-xxs) / 2) var(--st-length-spacing-xxs);
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

.c-event__description >>> p {
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
