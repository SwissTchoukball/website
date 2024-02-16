<template>
  <ul class="u-unstyled-list c-event-list">
    <li v-for="event of events" :key="`event-${event.id}`">
      <st-event :id="`event-${event.id}`" :event="event" :show-year="showYear" />
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import stEvent from '~/components/events/st-event.vue';
import { CalendarEvent } from '~/plugins/cms-service';

export default defineComponent({
  components: {
    stEvent,
  },
  props: {
    events: {
      type: Array as PropType<CalendarEvent[]>,
      required: true,
    },
    showYear: Boolean,
  },
});
</script>

<style scoped>
.c-event-list {
  display: flex;
  flex-direction: column;
  gap: var(--st-length-spacing-s);
}
</style>
