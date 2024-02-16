<template>
  <section class="l-main-content-section c-event-type-page">
    <st-breadcrumb :items="breadcrumb" />
    <h3 class="t-headline-1">{{ $t('events.eventTypeUpcoming.title', { name: eventTypeName }) }}</h3>
    <template v-if="events.length">
      <st-event-list :events="events" class="c-event-type-page__events" :show-year="true" />
    </template>
    <p v-else class="c-event-type-page__blank-slate">
      {{ $t('events.eventTypeUpcoming.none', { name: eventTypeName }) }}
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import stEventList from '~/components/events/st-event-list.vue';
import { BreadcrumbItem } from '~/components/st-breadcrumb.vue';
import { CalendarEvent } from '~/plugins/cms-service';

export default defineComponent({
  components: { stEventList },
  nuxtI18n: {
    paths: {
      fr: '/evenements/:slug',
      de: '/ereignisse/:slug',
    },
  },
  data() {
    return {
      eventTypeId: undefined as number | undefined,
      events: [] as CalendarEvent[],
      breadcrumb: [
        {
          pageName: 'calendar',
          displayName: this.$t('events.title'),
        },
      ] as BreadcrumbItem[],
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    if (slug.includes('-')) {
      this.eventTypeId = parseInt(slug.substr(0, slug.indexOf('-')));
    } else {
      this.eventTypeId = parseInt(slug);
    }

    if (!this.eventTypeId) {
      throw new Error('Invalid event type ID');
    }

    const eventsResult = await this.$cmsService.getEvents({
      limit: 50,
      typeId: this.eventTypeId,
      upcoming: true,
    });

    if (!eventsResult) {
      throw new Error('Error when retrieving events');
    }

    this.events = eventsResult.data;

    // We load the event types only if we don't have them already
    if (!this.$store.state.eventTypes) {
      await this.$store.dispatch('loadEventTypes');
    }
  },
  computed: {
    eventTypeName(): string {
      return this.eventTypeId ? this.$store.state.eventTypes[this.eventTypeId].name_plural : '';
    },
  },
});
</script>

<style scoped>
.c-event-type-page {
  margin-top: var(--st-length-spacing-xs);
}

.c-event-type-page__events {
  margin-top: var(--st-length-spacing-s);
}

.c-event-type-page__blank-slate {
  margin-top: var(--st-length-spacing-s);
}
</style>
