<script setup lang="ts">
const route = useRoute();
const localePath = useLocalePath();

defineI18nRoute({
  paths: {
    fr: '/calendrier/[year]',
    de: '/kalender/[year]',
  },
});

navigateTo(
  localePath({
    name: 'calendar-year-month-list',
    params: { year: route.params.year, month: '1' },
  }),
);
</script>
