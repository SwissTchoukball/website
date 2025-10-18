<template>
  <nav class="c-calendar-nav">
    <h3 class="u-visually-hidden">{{ $t('events.monthNavigation') }}</h3>
    <div class="t-headline-1 c-calendar-nav__name" aria-hidden="true">{{ monthName }}</div>
    <div class="c-calendar-nav__month-navigation">
      <nuxt-link :to="previousMonthLink" :title="$t('events.previousMonth')" class="c-calendar-nav__switch-link">
        <font-awesome-icon icon="angle-left" />
      </nuxt-link>
      <nuxt-link :to="nextMonthLink" :title="$t('events.nextMonth')" class="c-calendar-nav__switch-link">
        <font-awesome-icon icon="angle-right" />
      </nuxt-link>
    </div>

    <st-link-action v-if="!isCurrentMonth" :to="currentMonthLink" class="c-calendar-nav__link-to-current-month">
      {{ $t('events.goToCurrentMonth') }}
    </st-link-action>

    <div class="c-calendar-nav__spacer"></div>

    <div class="c-calendar-nav__actions">
      <st-tooltip position="bottom">
        <template #trigger>
          <a :href="icsUrl" class="c-calendar-nav__action">
            <font-awesome-icon icon="rss" />
          </a>
        </template>
        <template #content>
          {{ $t('events.subscribe') }}
        </template>
      </st-tooltip>
      <st-tooltip position="bottom">
        <template #trigger>
          <nuxt-link :to="alternativeViewPath" class="c-calendar-nav__action">
            <font-awesome-icon :icon="alternativeViewIcon" />
          </nuxt-link>
        </template>
        <template #content>
          {{ $t(`events.switch.${alternateView}`) }}
        </template>
      </st-tooltip>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { $formatDate } = useNuxtApp();
const { locale } = useI18n();
const localePath = useLocalePath();

const props = defineProps({
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
});

const monthName = computed<string>(() => {
  return $formatDate(new Date(props.year, props.month - 1, 1), 'MMMM yyyy');
});

const nextMonthLink = computed<string>(() => {
  let nextMonth = props.month + 1;
  let nextYear = props.year;
  if (props.month === 12) {
    nextMonth = 1;
    nextYear = props.year + 1;
  }
  return localePath({ params: { month: nextMonth.toString(), year: nextYear.toString() } });
});

const previousMonthLink = computed<string>(() => {
  let previousMonth = props.month - 1;
  let previousYear = props.year;
  if (props.month === 1) {
    previousMonth = 12;
    previousYear = props.year - 1;
  }
  return localePath({ params: { month: previousMonth.toString(), year: previousYear.toString() } });
});

const currentMonth = computed<number>(() => {
  return new Date().getMonth() + 1;
});

const currentYear = computed<number>(() => {
  return new Date().getFullYear();
});

const isCurrentMonth = computed<boolean>(() => {
  return props.month === currentMonth.value && props.year === currentYear.value;
});

const currentMonthLink = computed<string>(() => {
  return localePath({ params: { month: currentMonth.value.toString(), year: currentYear.value.toString() } });
});

const alternateView = computed<string>(() => {
  return props.currentView === 'list' ? 'month' : 'list';
});

const alternativeViewPath = computed<string>(() => {
  return localePath(`calendar-year-month-${alternateView.value}`);
});

const alternativeViewIcon = computed<string>(() => {
  return props.currentView === 'list' ? 'calendar-days' : 'list';
});

const icsUrl = computed<string>(() => {
  return `webcal://feeds.tchoukball.ch/events/all-${locale.value}.ics`;
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

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
  display: flex;
  gap: var(--st-length-spacing-xs);
}

.c-calendar-nav__action {
  /* We set the color explicitly to prevent the visited color to be applied */
  color: var(--st-color-link);
  font-size: 1.5em;
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
