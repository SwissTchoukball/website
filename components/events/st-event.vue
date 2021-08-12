<template>
  <div class="c-event">
    <img
      v-if="event.image"
      class="c-event__image"
      :alt="event.image.description"
      :src="mainImageFallbackSrc"
      :srcset="mainImageSrcSet"
      :sizes="`(min-width: 1400px) 1400px, 96vw`"
    />
    <div class="c-event__date">
      <span class="c-event__date-week-days">{{ weekDays }}</span>
      <span class="c-event__date-days">{{ days }}</span>
      <span class="c-event__date-months">{{ months }}</span>
    </div>
    <div class="c-event__main">
      <h3 class="t-headline-2 c-event__name">{{ event.name }}</h3>
      <div v-if="categoryName" class="c-event__category">{{ categoryName }}</div>
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
import { isSameDay, isSameMonth } from 'date-fns';
import { CalendarEvent } from '~/plugins/cms-service';
import { EventCategories, RootState } from '~/store/state';
import { getAssetSrcSet, getAssetURL } from '~/plugins/directus';

export default Vue.extend({
  props: {
    event: {
      type: Object as PropType<CalendarEvent>,
      required: true,
    },
  },
  computed: {
    isSingleDay(): boolean {
      return isSameDay(this.event.date_start, this.event.date_end);
    },
    isWithinSingleMonth(): boolean {
      return isSameMonth(this.event.date_start, this.event.date_end);
    },
    weekDays(): string {
      let weekDays = this.$formatDate(this.event.date_start, 'EEEE');
      if (!this.isSingleDay) {
        weekDays = `${this.$formatDate(this.event.date_start, 'EEE')} -  ${this.$formatDate(
          this.event.date_end,
          'EEE'
        )}`;
        weekDays = weekDays.replace(/\./g, '');
      }

      return weekDays;
    },
    days(): string {
      let days = this.$formatDate(this.event.date_start, 'd');
      if (!this.isSingleDay) {
        days += ` -  ${this.$formatDate(this.event.date_end, 'd')}`;
      }

      return days;
    },
    months(): string {
      let months = this.$formatDate(this.event.date_start, 'MMMM');
      if (!this.isWithinSingleMonth) {
        months = `${this.$formatDate(this.event.date_start, 'MMM')} -  ${this.$formatDate(this.event.date_end, 'MMM')}`;
        months = months.replace(/\./g, '');
      }

      return months;
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
    categories(): EventCategories | undefined {
      return (this.$store as Store<RootState>).state.eventCategories;
    },
    categoryName(): string | null {
      if (this.categories && this.event.category) {
        return this.categories[this.event.category].name;
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

.c-event__date {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.c-event__date > * {
  margin-right: var(--st-length-spacing-xxs);
}

.c-event__date-week-days {
  color: var(--st-color-event-day-of-week);
}

.c-event__date-months {
  color: var(--st-color-event-month);
}

.c-event__name {
  padding-top: var(--st-length-spacing-xs);
}

.c-event__main {
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

.c-event__category {
  color: var(--st-color-event-category);
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

  .c-event__date {
    flex-shrink: 0;
    flex-direction: column;
    margin-right: var(--st-length-spacing-s);
    width: 7rem;
  }

  .c-event__date > * {
    margin-right: 0;
  }

  .c-event__date-days {
    font-size: 2em;
  }

  .c-event__main {
    position: relative;
  }

  .c-event__name {
    padding-top: 0;
  }

  .c-event__category {
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
