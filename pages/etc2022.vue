<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('internationalCompetition.etc2022.title') }}</h2>
    <st-navigation
      :items="navigation"
      class="navigation"
      :name="$t('otherNavigation', { name: $t('internationalCompetition.etc2022.title') })"
      selected-on-exact-active
      small
    />
    <nuxt-child />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import { MenuItem } from '~/store/state';

export default defineComponent({
  data() {
    return {
      navigation: [
        { name: this.$t('internationalCompetition.navigation.live'), href: this.localePath('etc2022-live') },
        { name: this.$t('internationalCompetition.navigation.schedule'), href: this.localePath('etc2022-schedule') },
        { name: this.$t('internationalCompetition.navigation.medias'), href: this.localePath('etc2022-medias') },
      ] as MenuItem[],
    };
  },
  head(): MetaInfo {
    const title = this.$t('internationalCompetition.etc2022.title').toString();
    const description = this.$t('internationalCompetition.etc2022.shortDescription').toString();

    const metaInfo: MetaInfo = {
      title,
      meta: [
        { property: 'og:title', content: title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    };

    return metaInfo;
  },
});
</script>

<style scoped>
.navigation {
  margin-top: var(--st-length-spacing-s);
  margin-bottom: var(--st-length-spacing-s);
}
</style>
