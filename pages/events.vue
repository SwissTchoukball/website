<template>
  <section class="l-main-content-section">
    <h2>{{ $t('events.title') }}</h2>
    <p>Rien à voir pour l'instant</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  head: {
    title: 'Événements',
  },
  nuxtI18n: {
    paths: {
      fr: '/evenements',
      de: '/ereignisse',
    },
  },
});
</script>
