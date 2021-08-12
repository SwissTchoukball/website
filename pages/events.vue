<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ monthName }}</h2>
    <nav class="c-events__month-navigation">
      <h3 class="u-visually-hidden">{{ $t('events.monthNavigation') }}</h3>
      <nuxt-link :to="previousMonthLink" :title="$t('events.previousMonth')" class="c-events__month-switch-link">
        <fa-icon icon="angle-left" />
      </nuxt-link>
      <div class="t-headline-1 c-events__month-name" aria-hidden="true">{{ monthName }}</div>
      <nuxt-link :to="nextMonthLink" :title="$t('events.nextMonth')" class="c-events__month-switch-link">
        <fa-icon icon="angle-right" />
      </nuxt-link>
    </nav>
    <st-loader v-if="$fetchState.pending" class="c-events__loader" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }}</p>
    <template v-else-if="events.length">
      <st-event v-for="event of events" :key="`event-${event.id}`" :event="event" class="c-events__event" />
    </template>
    <p v-else class="c-events__no-events">{{ $t('events.noneThisMonth', { month: monthName }) }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { CalendarEvent } from '~/plugins/cms-service';
import stEvent from '~/components/events/st-event.vue';
import { isDigitsString } from '~/utils/utils';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/evenements',
      de: '/ereignisse',
    },
  },
  components: {
    stEvent,
  },
  data() {
    return {
      // TODO: Add pagination as currently only the 50 first events in a month are visible
      eventsPerPage: 50,
      totalEvents: undefined as number | undefined,
      currentPage: 1,
      events: [] as CalendarEvent[],
      month: this.$formatDate(new Date(), 'MM'),
      year: this.$formatDate(new Date(), 'yyyy'),
    };
  },
  async fetch() {
    let filteredCategoryId: number | undefined;
    if (typeof this.$route.query.category === 'string') {
      filteredCategoryId = parseInt(this.$route.query.category);
    }

    if (isDigitsString(this.$route.query.year)) {
      this.year = this.$route.query.year;
    }

    if (isDigitsString(this.$route.query.month)) {
      this.month = this.$route.query.month.length === 2 ? this.$route.query.month : `0${this.$route.query.month}`;
    }

    const eventsResult = await this.$cmsService.getEvents({
      limit: this.eventsPerPage,
      page: this.currentPage,
      categoryId: filteredCategoryId,
      month: `${this.year}-${this.month}`,
    });

    this.events = eventsResult.data;
    this.totalEvents = eventsResult.meta.total;

    // We load the categories only if we don't have them already
    if (!this.$store.state.eventCategories) {
      await this.$store.dispatch('loadEventCategories');
    }
  },
  head() {
    return {
      title: this.$t('events.title').toString(),
    };
  },
  computed: {
    monthName(): string {
      return this.$formatDate(new Date(`${this.year}-${this.month}-01`), 'MMMM yyyy');
    },
    nextMonthLink(): string {
      let nextMonth = parseInt(this.month) + 1;
      let nextYear = parseInt(this.year);
      if (this.month === '12') {
        nextMonth = 1;
        nextYear = parseInt(this.year) + 1;
      }
      return this.localePath({ query: { month: nextMonth, year: nextYear } });
    },
    previousMonthLink(): string {
      let previousMonth = parseInt(this.month) - 1;
      let previousYear = parseInt(this.year);
      if (this.month === '01') {
        previousMonth = 12;
        previousYear = parseInt(this.year) - 1;
      }
      return this.localePath({ query: { month: previousMonth, year: previousYear } });
    },
  },
  watch: {
    '$route.query': '$fetch',
  },
});
</script>

<style scoped>
.c-events__month-name {
  text-transform: capitalize;
  padding-top: 0;
}

.c-events__month-navigation {
  width: 100%;
  padding-top: var(--st-length-spacing-s);
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-events__month-switch-link {
  font-size: 2em;
  color: var(--st-color-event-month-switch-link);
}

.c-events__month-switch-link:first-of-type {
  margin-right: var(--st-length-spacing-s);
}

.c-events__month-switch-link:last-of-type {
  margin-left: var(--st-length-spacing-s);
}

.c-events__loader {
  margin: auto;
  margin-top: var(--st-length-spacing-m);
}

.c-events__event {
  margin-top: var(--st-length-spacing-s);
}

.c-events__no-events {
  text-align: center;
  padding: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .c-events__month-navigation {
    width: auto;
    justify-content: initial;
  }
}
</style>
