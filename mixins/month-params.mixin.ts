import Vue from 'vue';
import { isDigitsString } from '~/utils/utils';

export default Vue.extend({
  validate({ params }) {
    return isDigitsString(params.year) && isDigitsString(params.month);
  },
  data() {
    return {
      month: parseInt(this.$route.params.month),
      year: parseInt(this.$route.params.year),
    };
  },
  computed: {
    monthName(): string {
      return this.$formatDate(
        new Date(parseInt(this.$route.params.year), parseInt(this.$route.params.month) - 1),
        'MMMM yyyy'
      );
    },
    yearMonthString(): string {
      return this.$formatDate(
        new Date(parseInt(this.$route.params.year), parseInt(this.$route.params.month) - 1),
        'yyyy-MM'
      );
    },
  },
});
