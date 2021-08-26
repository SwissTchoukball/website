<template>
  <div class="c-event" :class="{ 'c-event--no-image': !event.image }">
    <img
      v-if="event.image"
      class="c-event__image"
      :alt="event.image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="`(min-width: 1400px) 1400px, 96vw`"
    />
    <st-event-date :start-date="event.date_start" :end-date="event.date_end" />
    <div class="c-event__main">
      <h3 class="t-headline-2 c-event__name">
        <nuxt-link :to="{ hash: `event-${event.id}` }" class="c-event__name-link">{{ event.name }}</nuxt-link>
      </h3>
      <div v-if="eventTypeName" class="c-event__type">{{ eventTypeName }}</div>
      <div class="directus-formatted-content c-event__description" v-html="event.description"></div>
      <div v-if="event.venue" class="c-event__venue">
        <fa-icon icon="map-marker-alt" class="c-event__icon" />
        <span>{{ event.venue.name }}</span>
      </div>
      <div class="c-event__time">
        <fa-icon icon="clock" class="c-event__icon" />
        <span>{{ time }}</span>
      </div>
      <st-button v-if="event.url" :href="event.url" primary class="c-event__link">
        {{ $t('events.moreInfo') }}
      </st-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
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
  computed: {
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
        // TODO: Consider renaming newsAssetsSizes to be more generic
        width: this.$config.newsAssetsSizes[0],
      });
    },
    mainImageSrcSet(): string {
      if (!this.event.image) {
        return '';
      }
      return getAssetSrcSet(this.$config.cmsURL, this.event.image.id, {
        // TODO: Consider renaming newsAssetsSizes to be more generic
        widths: this.$config.newsAssetsSizes,
      });
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

.c-event__type {
  color: var(--st-color-event-type);
  font-weight: bold;
  font-size: 0.9em;
  padding-top: var(--st-length-spacing-xxs);
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

.c-event__icon {
  width: 1rem;
  color: var(--st-color-event-icon);
  margin-right: var(--st-length-spacing-xxs);
}

.c-event__link {
  align-self: flex-end;
}

@media (--sm-and-up) {
  .c-event {
    flex-direction: row;
  }

  .c-event__main {
    position: relative;
  }

  .c-event__name {
    padding-top: 0;
  }

  .c-event__type {
    position: absolute;
    top: 0;
    right: 0;
    padding-top: 0;
  }

  .c-event__link {
    position: absolute;
    bottom: 0;
    right: 0;
  }
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
