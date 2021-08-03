<template>
  <nav>
    <h2 class="u-visually-hidden">{{ $t('langSwitcherTitle') }}</h2>
    <ul class="u-unstyled-list c-lang-switcher__list">
      <li v-for="locale in availableLocales" :key="locale.code" class="c-lang-switcher__lang-item">
        <nuxt-link
          :to="switchLocalePath(locale.code)"
          class="c-lang-switcher__lang-link"
          :class="{ 'c-lang-switcher__lang-link--active': locale.code === currentLocale }"
        >
          {{ locale.name }}
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  computed: {
    currentLocale() {
      return this.$i18n.locale;
    },
    availableLocales() {
      return this.$i18n.locales;
    },
  },
});
</script>

<style scoped>
.c-lang-switcher__list {
  text-align: center;
}

.c-lang-switcher__lang-item {
  display: inline-block;
  margin: 0 var(--st-length-spacing-xs);
}

.c-lang-switcher__lang-item:first-child {
  margin-left: 0;
}

.c-lang-switcher__lang-item:last-child {
  margin-right: 0;
}

.c-lang-switcher__lang-link {
  text-decoration: none;
  font-weight: bold;
  color: var(--st-color-text);
}

.c-lang-switcher__lang-link--active {
  color: var(--st-color-active-lang);
}
</style>
