<template>
  <!--
    NOTE: This component is not used any more.
    It hasn't been removed in case it could be needed.
    If it isn't used for a while, we could consider removing it.
  -->
  <nav class="c-select-navigation">
    <h2 class="u-visually-hidden">{{ name }}</h2>
    <button
      :aria-haspopup="true"
      :aria-expanded="open"
      class="u-unstyled-button c-select-navigation__button t-headline-3"
      @click.stop="toggleSelect()"
    >
      <slot></slot>
    </button>
    <ul v-if="open" class="u-unstyled-list c-select-navigation__options">
      <li v-for="(option, index) in options" :key="index" class="c-select-navigation__option">
        <nuxt-link :to="option.href ? localePath(option.href) : undefined" @click="onItemClickNative(option)">
          {{ option.name }}
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const localePath = useLocalePath();

defineProps({
  /**
   * Name of the navigation, visible to screen readers.
   */
  name: {
    type: String,
    required: true,
  },
  options: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
  initialOptionName: {
    type: Object as PropType<MenuItem>,
    default: null,
  },
});

const open = ref(false);

const toggleSelect = () => {
  open.value = !open.value;
};

const onItemClickNative = (_item: MenuItem) => {
  open.value = false;
};
</script>

<style scoped>
.c-select-navigation {
  position: relative;
}

.c-select-navigation__options {
  background-color: var(--st-color-wide-navigation-sub-items-background);
  backdrop-filter: blur(5px); /* Does not work yet on Firefox, but that's okay as it's only nice to have */
  box-shadow: var(--st-shadow-navigation);
  border-radius: 5px;
  position: absolute;
  padding: var(--st-length-spacing-xs);
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, auto);
  column-gap: 1.5rem;
  z-index: 2;
}

.c-select-navigation__option a {
  text-decoration: none;
  color: var(--st-color-wide-navigation-item);
  display: inline-block;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
}

.c-select-navigation__option a.router-link-active {
  color: red;
  pointer-events: none;
}

.c-select-navigation__option a.router-link-active:hover {
  background-color: none;
  cursor: default;
}

.c-select-navigation__option a:hover,
.c-select-navigation__option a:active {
  background-color: var(--st-color-wide-navigation-item-active-background);
}
</style>
