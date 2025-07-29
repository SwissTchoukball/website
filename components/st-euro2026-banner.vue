<template>
  <div v-if="daysUntilEuro2026 <= 365" class="c-euro2026-banner-wrapper">
    <a class="c-euro2026-banner" href="https://euro2026.ch">
      <st-euro2026-logo class="c-euro2026-banner__logo" />
      <span v-if="daysUntilEuro2026 > 0">{{ $t('d-minus', { days: daysUntilEuro2026 }) }}</span>
      <span v-else class="c-euro2026-banner__dates">{{ $t('euro2026dates') }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { differenceInDays } from 'date-fns';

const daysUntilEuro2026 = computed(() => {
  const today = new Date();
  const euroStartDate = new Date('2026-08-01');
  return differenceInDays(euroStartDate, today);
});
</script>

<style scoped>
.c-euro2026-banner-wrapper {
  display: flex;
  justify-content: center;
}

.c-euro2026-banner {
  display: flex;
  gap: var(--st-length-spacing-xxs);
  padding: var(--st-length-spacing-xs) var(--st-length-spacing-s);
  border-radius: 10000px;
  color: var(--st-color-euro-blue-500);
  font-weight: 900;
  font-size: 1.5rem;
  line-height: 1;
  text-decoration: none;
  transition: all 150ms ease-in-out;
  box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
}

.c-euro2026-banner:hover {
  background-color: var(--st-color-euro-blue-500);
  color: white;
  transform: scale(1.03);
  box-shadow: rgb(100 100 111 / 20%) 0 7px 29px 0;
}

.c-euro2026-banner:active {
  transform: scale(0.98);
}

.c-euro2026-banner__logo {
  height: 1.5rem;
}

.c-euro2026-banner__dates {
  white-space: nowrap;
  padding-left: var(--st-length-spacing-xs);
}
</style>
