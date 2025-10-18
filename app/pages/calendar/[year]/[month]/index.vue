<script setup lang="ts">
const localePath = useLocalePath();
const route = useRoute();

defineI18nRoute({
  paths: {
    fr: '/calendrier/[year]/[month]',
    de: '/kalender/[year]/[month]',
  },
});

navigateTo(
  localePath({
    name: 'calendar-year-month-list',
    params: { year: route.params.year, month: route.params.month },
  }),
);
</script>
