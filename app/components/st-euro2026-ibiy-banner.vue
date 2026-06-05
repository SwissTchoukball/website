<template>
  <a class="c-euro2026-ibiy-banner" href="https://ibiy.net/swisstchoukball">
    <img
      :src="`/images/banner-ibiy-euro2026-medium-${locale}.svg`"
      loading="lazy"
      :alt="$t('euro2026ibiyBannerAltText')"
      class="c-euro2026-ibiy-banner__image c-euro2026-ibiy-banner__image--medium"
    />
    <img
      :src="`/images/banner-ibiy-euro2026-small-${locale}.svg`"
      loading="lazy"
      :alt="$t('euro2026ibiyBannerAltText')"
      class="c-euro2026-ibiy-banner__image c-euro2026-ibiy-banner__image--small"
    />
  </a>
</template>

<script lang="ts" setup>
const { locale } = useI18n();
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-euro2026-ibiy-banner {
  display: block;
  width: 100%;
  margin-block: var(--st-length-spacing-s);
}

.c-euro2026-ibiy-banner__image {
  width: 100%;
}

.c-euro2026-ibiy-banner__image--medium {
  display: none;
  max-width: 40rem;
  margin-inline: auto;

  @media (--sm-and-up) {
    display: block;
  }
}

.c-euro2026-ibiy-banner__image--small {
  display: block;

  @media (--sm-and-up) {
    display: none;
  }
}
</style>
