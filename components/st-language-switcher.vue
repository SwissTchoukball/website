<template>
  <nav>
    <h2 class="u-visually-hidden">{{ $t('langSwitcherTitle') }}</h2>
    <ul class="u-unstyled-list c-lang-switcher__list">
      <li v-for="availableLocale in locales" :key="availableLocale.code" class="c-lang-switcher__lang-item">
        <nuxt-link
          :to="switchLocalePath(availableLocale.code)"
          class="c-lang-switcher__lang-link"
          :class="{ 'c-lang-switcher__lang-link--active': availableLocale.code === currentLocale }"
        >
          {{ availableLocale.name }}
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const switchLocalePath = useSwitchLocalePath();
const { locale: currentLocale, locales } = useI18n();
</script>

<style scoped>
.c-lang-switcher__list {
  text-align: center;
  white-space: nowrap;
}

.c-lang-switcher__lang-item {
  display: inline-block;
  margin: 0 calc(var(--st-length-spacing-xs) / 2);
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
