<template>
  <div>&nbsp;</div>
</template>

<script setup lang="ts">
const localePath = useLocalePath();

defineI18nRoute({
  paths: {
    fr: '/calendrier',
    de: '/kalender',
  },
});

useAsyncData('news', async () => {
  const now = new Date();
  navigateTo(
    localePath({
      name: 'calendar-year-month-list',
      params: { year: now.getFullYear().toString(), month: (now.getMonth() + 1).toString() },
    }),
  );
});
</script>
