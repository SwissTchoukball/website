<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('etc2022.title') }}</h2>
    <st-navigation
      :items="etcNavigation"
      class="c-etc__navigation"
      :name="$t('otherNavigation', { name: $t('etc2022.title') })"
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
      etcNavigation: [
        { name: this.$t('etc2022.navigation.liveNews'), href: this.localePath('etc2022') },
        { name: this.$t('etc2022.navigation.schedule'), href: this.localePath('etc2022-schedule') },
        { name: this.$t('etc2022.navigation.medias'), href: this.localePath('etc2022-medias') },
      ] as MenuItem[],
    };
  },
});
</script>

<style scoped>
.c-etc__navigation {
  margin-top: var(--st-length-spacing-s);
}
</style>
