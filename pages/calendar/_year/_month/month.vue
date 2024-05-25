<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ $t('events.title') }} - {{ monthName }}</h2>

    <st-calendar-nav class="c-calendar-month__calendar-navigation" :year="year" :month="month" current-view="month" />

    <st-month-calendar class="c-calendar-month__calendar" :year="year" :month="month" :events="events" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { addDays, getWeeksInMonth, startOfMonth, startOfWeek } from 'date-fns';

import monthParamsMixin from '~/mixins/month-params.mixin';
import stCalendarNav from '~/components/events/st-calendar-nav.vue';
import stMonthCalendar from '~/components/events/st-month-calendar.vue';
import { CalendarEvent, CMSService } from '~/plugins/cms-service';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/calendrier/:year/:month/mois',
      de: '/kalendar/:year/:month/monat',
    },
  },
  components: {
    stCalendarNav,
    stMonthCalendar,
  },
  mixins: [monthParamsMixin],
  data() {
    return {
      events: [] as CalendarEvent[],
    };
  },
  async fetch() {
    const eventsResult = await this.getEvents();

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }

    this.events = eventsResult.data;

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
    }
  },
  head() {
    return {
      title: `${this.$t('events.title')} - ${this.monthName}`,
      meta: [
        { property: 'og:title', content: this.$t('events.title').toString() },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('events.description').toString(),
        },
      ],
    };
  },
  methods: {
    async getEvents(): ReturnType<CMSService['getEvents']> {
      const firstDayOfMonth = startOfMonth(new Date(this.year, this.month, -1));
      const calendarFirstDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
      const calendarLastDay = addDays(calendarFirstDay, getWeeksInMonth(firstDayOfMonth, { weekStartsOn: 1 }) * 7);
      return await this.$cmsService.getEvents({
        limit: 1000,
        endDateAfter: calendarFirstDay,
        startDateBefore: calendarLastDay,
      });
    },
  },
});
</script>

<style scoped>
.c-calendar-month__calendar-navigation {
  padding-top: var(--st-length-spacing-s);
  width: 100%;
}

.c-calendar-month__calendar {
  min-height: min(60vw, 90vh);
  width: 98vw;
  margin-left: calc(-1 * var(--st-length-main-content-side-padding) + 1vw);
}
</style>
