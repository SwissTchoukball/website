<template>
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
        <nuxt-link :to="localePath(option.href)" @click.native="onItemClickNative(option)">{{ option.name }}</nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  props: {
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
  },
  data() {
    return {
      open: false,
    };
  },
  methods: {
    toggleSelect() {
      this.open = !this.open;
    },
    onItemClickNative(_item: MenuItem) {
      this.open = false;
    },
  },
});
</script>

<style scoped>
.c-select-navigation {
  position: relative;
}

.c-select-navigation__options {
  background-color: var(--st-color-wide-navigation-sub-items-background);
  backdrop-filter: blur(5px); /* Does not work yet on Firefox, but that's okay as it's only nice to have */
  box-shadow: rgba(100, 100, 111, 0.2) 0 7px 29px 0;
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

.c-select-navigation__option a.nuxt-link-active {
  color: red;
  pointer-events: none;
}
.c-select-navigation__option a.nuxt-link-active:hover {
  background-color: none;
  cursor: default;
}

.c-select-navigation__option a:hover,
.c-select-navigation__option a:active {
  background-color: var(--st-color-wide-navigation-item-active-background);
}
</style>
