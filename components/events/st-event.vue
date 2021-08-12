<template>
  <div class="c-event">
    <h3>{{ event.name }}</h3>
    <p>
      {{ weekDays }}
    </p>

    <p>
      {{ days }}
    </p>
    <p>
      {{ months }}
    </p>
    <div class="directus-formatted-content" v-html="event.description"></div>
    <p v-if="categoryName">{{ categoryName }}</p>
    <p v-if="event.venue">{{ event.venue.name }}</p>
    <p>{{ time }}</p>
    <a v-if="event.url" :href="event.url">{{ $t('events.moreInfo') }}</a>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Store } from 'vuex';
import { isSameDay, isSameMonth } from 'date-fns';
import { CalendarEvent } from '~/plugins/cms-service';
import { EventCategories, RootState } from '~/store/state';

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
      if (this.categories) {
        return this.categories[this.event.category].name;
      } else {
        return null;
      }
    },
  },
});
</script>

<style scoped>
.c-event {
  display: block;
}
</style>
