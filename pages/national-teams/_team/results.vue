<template>
  <div>
    <p>TODO</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  nuxtI18n: {
    paths: {
      fr: '/equipes-nationales/:team/resultats',
      de: '/nationalteams/:team/resultate',
    },
  },
});
</script>
