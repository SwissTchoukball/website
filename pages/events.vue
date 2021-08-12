<template>
  <section class="l-main-content-section">
    <nuxt-link :to="previousMonthLink">Previous month</nuxt-link>
    <h2>{{ monthName }}</h2>
    <nuxt-link :to="nextMonthLink">Next month</nuxt-link>
    <st-event v-for="event of events" :key="`event-${event.id}`" :event="event" />
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
