<template>
  <a class="c-euro2026-ibiy-banner" href="https://ibiy.net/swisstchoukball">
    <img
      src="/images/banner-ibiy-euro2026-medium.svg"
      loading="lazy"
      alt="Campagne “I Believe In You” pour soutenir l’organisation des championnats d'Europe 2026 en Suisse"
      class="c-euro2026-ibiy-banner__image c-euro2026-ibiy-banner__image--medium"
    />
    <img
      src="/images/banner-ibiy-euro2026-small.svg"
      loading="lazy"
      alt="Campagne “I Believe In You” pour soutenir l’organisation des championnats d'Europe 2026 en Suisse"
      class="c-euro2026-ibiy-banner__image c-euro2026-ibiy-banner__image--small"
    />
  </a>
</template>

<script lang="ts" setup></script>

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
