<template>
  <nav class="c-calendar-nav">
    <h3 class="u-visually-hidden">{{ $t('events.monthNavigation') }}</h3>
    <div class="t-headline-1 c-calendar-nav__name" aria-hidden="true">{{ monthName }}</div>
    <div class="c-calendar-nav__month-navigation">
      <nuxt-link :to="previousMonthLink" :title="$t('events.previousMonth')" class="c-calendar-nav__switch-link">
        <fa-icon icon="angle-left" />
      </nuxt-link>
      <nuxt-link :to="nextMonthLink" :title="$t('events.nextMonth')" class="c-calendar-nav__switch-link">
        <fa-icon icon="angle-right" />
      </nuxt-link>
    </div>

    <st-link-action v-if="!isCurrentMonth" :to="currentMonthLink" class="c-calendar-nav__link-to-current-month">
      {{ $t('events.goToCurrentMonth') }}
    </st-link-action>

    <div class="c-calendar-nav__spacer"></div>

    <div class="c-calendar-nav__actions">
      <a v-tooltip.bottom="$t('events.subscribe')" :href="icsUrl" class="c-calendar-nav__action">
        <fa-icon icon="rss" />
      </a>
      <nuxt-link
        v-tooltip.bottom="$t(`events.switch.${alternateView}`)"
        :to="alternativeViewPath"
        class="c-calendar-nav__action"
      >
        <fa-icon :icon="alternativeViewIcon" />
      </nuxt-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    currentView: {
      type: String,
      default: 'list',
    },
  },
  computed: {
    monthName(): string {
      return this.$formatDate(new Date(this.year, this.month - 1, 1), 'MMMM yyyy');
    },
    nextMonthLink(): string {
      let nextMonth = this.month + 1;
      let nextYear = this.year;
      if (this.month === 12) {
        nextMonth = 1;
        nextYear = this.year + 1;
      }
      return this.localePath({ params: { month: nextMonth.toString(), year: nextYear.toString() } });
    },
    previousMonthLink(): string {
      let previousMonth = this.month - 1;
      let previousYear = this.year;
      if (this.month === 1) {
        previousMonth = 12;
        previousYear = this.year - 1;
      }
      return this.localePath({ params: { month: previousMonth.toString(), year: previousYear.toString() } });
    },
    currentMonth(): number {
      return new Date().getMonth() + 1;
    },
    currentYear(): number {
      return new Date().getFullYear();
    },
    isCurrentMonth(): boolean {
      return this.month === this.currentMonth && this.year === this.currentYear;
    },
    currentMonthLink(): string {
      return this.localePath({ params: { month: this.currentMonth.toString(), year: this.currentYear.toString() } });
    },
    alternateView(): string {
      return this.currentView === 'list' ? 'month' : 'list';
    },
    alternativeViewPath(): string {
      return this.localePath(`calendar-year-month-${this.alternateView}`);
    },
    alternativeViewIcon(): string {
      return this.currentView === 'list' ? 'calendar-days' : 'list';
    },
    icsUrl(): string {
      return `webcal://feeds.tchoukball.ch/events/all-${this.$i18n.locale}.ics`;
    },
  },
});
</script>

<style scoped>
.c-calendar-nav {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--st-length-spacing-xs);
}

.c-calendar-nav__month-navigation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--st-length-spacing-xs);
}

.c-calendar-nav__name {
  text-transform: capitalize;
  text-align: center;
  padding-top: 0;
  width: 100%;
}

.c-calendar-nav__switch-link {
  font-size: 2em;
  color: var(--st-color-event-month-switch-link);
}

.c-calendar-nav__link-to-current-month {
  font-size: 0.8em;
}

.c-calendar-nav__spacer {
  display: none;
}

.c-calendar-nav__actions {
  align-self: flex-end;
  font-size: 1.5em;
  display: flex;
  gap: var(--st-length-spacing-xs);
}

.c-calendar-nav__action {
  /* We set the color explicitly to prevent the visited color to be applied */
  color: var(--st-color-link);
}

@media (--sm-and-up) {
  .c-calendar-nav__month-navigation {
    order: -1;
  }

  .c-calendar-nav__name {
    width: auto;
  }

  .c-calendar-nav__spacer {
    display: block;
    flex-grow: 2;
  }

  .c-calendar-nav__actions {
    align-self: inherit;
  }
}
</style>
