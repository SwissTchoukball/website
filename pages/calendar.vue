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
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else-if="events.length">
      <st-link-action v-if="showUpcoming" :to="thisMonthLink" class="c-events__past-events-link">
        {{ $t('events.showPastEvents', { month: monthName }) }}
      </st-link-action>
      <st-link-action v-else-if="isCurrentMonth" :to="localePath({ query: {} })" class="c-events__past-events-link">
        {{ $t('events.showUpcomingEventsOnly', { month: monthName }) }}
      </st-link-action>
      <st-event
        v-for="event of events"
        :id="`event-${event.id}`"
        :key="`event-${event.id}`"
        :event="event"
        class="c-events__event"
      />
    </template>
    <p v-else class="l-blank-slate-message">{{ $t('events.noneThisMonth', { month: monthName }) }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { CMSService, CalendarEvent } from '~/plugins/cms-service';
import stEvent from '~/components/events/st-event.vue';
import { isDigitsString } from '~/utils/utils';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/calendrier',
      de: '/kalendar',
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
      filteredTypeId: undefined as number | undefined,
      month: this.$formatDate(new Date(), 'MM'),
      year: this.$formatDate(new Date(), 'yyyy'),
      showUpcoming: true,
    };
  },
  async fetch() {
    if (typeof this.$route.query.type === 'string') {
      this.filteredTypeId = parseInt(this.$route.query.type);
    }

    // Reseting this data in case we specifically ask for it
    this.showUpcoming = true;

    if (isDigitsString(this.$route.query.year)) {
      this.year = this.$route.query.year;
      this.showUpcoming = false;
    }

    if (isDigitsString(this.$route.query.month)) {
      this.month = this.$route.query.month.length === 2 ? this.$route.query.month : `0${this.$route.query.month}`;
      this.showUpcoming = false;
    }

    let eventsResult = await this.getEvents();

    // If there's no upcoming event, we show the past events this month
    if (!eventsResult.data.length && this.showUpcoming) {
      this.showUpcoming = false;
      eventsResult = await this.getEvents();
    }

    this.events = eventsResult.data;
    this.totalEvents = eventsResult.meta.total;

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
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
    isCurrentMonth(): boolean {
      return this.month === this.$formatDate(new Date(), 'MM') && this.year === this.$formatDate(new Date(), 'yyyy');
    },
    thisMonthLink(): string {
      return this.localePath({ query: { month: this.month } });
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
    '$route.query.month': '$fetch',
    '$route.query.year': '$fetch',
    '$route.query.type': '$fetch',
  },
  methods: {
    async getEvents(): ReturnType<CMSService['getEvents']> {
      return await this.$cmsService.getEvents({
        limit: this.eventsPerPage,
        page: this.currentPage,
        typeId: this.filteredTypeId,
        month: `${this.year}-${this.month}`,
        upcoming: this.showUpcoming,
      });
    },
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

.c-events__past-events-link {
  display: block;
  text-align: center;
  margin-top: var(--st-length-spacing-xs);
  font-size: 0.8em;
}

.c-events__event {
  margin-top: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .c-events__month-navigation {
    width: auto;
    justify-content: initial;
  }
}
</style>
