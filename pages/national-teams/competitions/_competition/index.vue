<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MenuItem } from '~/store/state';

export default defineComponent({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/competitions/:competition',
      de: '/nationalteams/wettbewerbe/:competition',
    },
  },
  props: {
    navigation: {
      type: Array as PropType<MenuItem[]>,
      required: true,
    },
  },
  created() {
    if (this.navigation[0].href) {
      this.$router.push(this.navigation[0].href);
    } else {
      console.warn('No navigation to redirect to');
    }
  },
});
</script>
