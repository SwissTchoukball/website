import { isDigitsString } from '~/utils/utils';

export function useMonthParams() {
  const route = useRoute();
  const { $formatDate } = useNuxtApp();

  definePageMeta({
    validate: async (route) => {
      return isDigitsString(route.params.year) && isDigitsString(route.params.month);
    },
  });

  const month = ref(parseInt(route.params.month as string));
  const year = ref(parseInt(route.params.year as string));

  const monthName = computed<string>(() => {
    return $formatDate(new Date(year.value, month.value - 1), 'MMMM yyyy');
  });
  const yearMonthString = computed<string>(() => {
    return $formatDate(new Date(year.value, month.value - 1), 'yyyy-MM');
  });

  return {
    month,
    year,
    monthName,
    yearMonthString,
  };
}
