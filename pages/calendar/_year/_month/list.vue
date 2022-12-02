<template>
  <section class="l-main-content-section">
    <h2 class="u-visually-hidden">{{ $t('events.title') }}</h2>

    <st-calendar-nav class="c-calendar-list__calendar-navigation" :year="year" :month="month" current-view="list" />

    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">{{ $t('error.otherError') }} : {{ $fetchState.error.message }}</p>
    <template v-else>
      <p v-if="!events.length" class="l-blank-slate-message">{{ $t('events.noneThisMonth', { month: monthName }) }}</p>
      <template v-else>
        <st-link-action
          v-if="showUpcomingEventsOnly && arePastEventsThisMonth"
          class="c-calendar-list__past-events-link"
          @click="showUpcomingEventsOnly = false"
        >
          {{ $t('events.showPastEvents', { month: monthName }) }}
        </st-link-action>
        <st-link-action
          v-else-if="!showUpcomingEventsOnly && upcomingEvents.length > 0 && events.length !== upcomingEvents.length"
          class="c-calendar-list__past-events-link"
          @click="showUpcomingEventsOnly = true"
        >
          {{ $t('events.showUpcomingEventsOnly', { month: monthName }) }}
        </st-link-action>

        <template v-if="visibleEvents.length">
          <st-event
            v-for="event of visibleEvents"
            :id="`event-${event.id}`"
            :key="`event-${event.id}`"
            :event="event"
            class="c-calendar-list__event"
          />
        </template>
      </template>
    </template>
  </section>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import stEvent from '~/components/events/st-event.vue';
import stCalendarNav from '~/components/events/st-calendar-nav.vue';
import { CalendarEvent, CMSService } from '~/plugins/cms-service';
import monthParamsMixin from '~/mixins/month-params.mixin';

export default (Vue as VueConstructor<Vue & InstanceType<typeof monthParamsMixin>>).extend({
  nuxtI18n: {
    paths: {
      fr: '/calendrier/:year/:month/liste',
      de: '/kalendar/:year/:month/liste',
    },
  },
  components: {
    stEvent,
    stCalendarNav,
  },
  mixins: [monthParamsMixin],
  data() {
    return {
      events: [] as CalendarEvent[],
      upcomingEvents: [] as CalendarEvent[],
      filteredTypeId: undefined as number | undefined,
      showUpcomingEventsOnly: false,
    };
  },
  async fetch() {
    const eventsResult = await this.getEvents();

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }

    this.events = eventsResult.data;
    this.upcomingEvents = this.events.filter((event) => event.date_end >= new Date());

    const now = new Date();
    if (
      this.arePastEventsThisMonth &&
      this.upcomingEvents.length > 0 &&
      now.getFullYear() === this.year &&
      now.getMonth() + 1 === this.month
    ) {
      this.showUpcomingEventsOnly = true;
    }

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
    }
  },
  head() {
    return {
      title: this.$t('events.title').toString(),
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
  computed: {
    arePastEventsThisMonth(): boolean {
      return this.events.length !== this.upcomingEvents.length;
    },
    visibleEvents(): CalendarEvent[] {
      return this.showUpcomingEventsOnly ? this.upcomingEvents : this.events;
    },
  },
  methods: {
    async getEvents(): ReturnType<CMSService['getEvents']> {
      // TODO: Add pagination as currently only the 50 first events in a month are visible
      return await this.$cmsService.getEvents({
        limit: 50,
        typeId: this.filteredTypeId,
        month: this.yearMonthString,
      });
    },
  },
});
</script>

<style scoped>
.c-calendar-list__calendar-navigation {
  padding-top: var(--st-length-spacing-s);
  width: 100%;
}

.c-calendar-list__past-events-link {
  display: block;
  text-align: center;
  margin-top: var(--st-length-spacing-xs);
  font-size: 0.8em;
}

.c-calendar-list__event {
  margin-top: var(--st-length-spacing-s);
}
</style>
