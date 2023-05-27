<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('internationalCompetition.wytc2023.title') }}</h2>
    <st-navigation
      :items="navigation"
      class="navigation"
      :name="$t('otherNavigation', { name: $t('internationalCompetition.wytc2023.title') })"
      selected-on-exact-active
      small
    />
    <nuxt-child />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  data() {
    return {
      navigation: [
        { name: this.$t('internationalCompetition.navigation.about'), href: this.localePath('wytc2023-about') },
        { name: this.$t('internationalCompetition.navigation.schedule'), href: this.localePath('wytc2023-schedule') },
        { name: this.$t('internationalCompetition.navigation.medias'), href: this.localePath('wytc2023-medias') },
        { name: this.$t('internationalCompetition.navigation.team'), href: this.localePath('wytc2023-teams') },
      ] as MenuItem[],
    };
  },
});
</script>

<style scoped>
.navigation {
  margin-top: var(--st-length-spacing-s);
  margin-bottom: var(--st-length-spacing-s);
}
</style>
