<template>
  <nav
    class="c-navigation"
    :class="{
      'c-navigation--narrow': narrow,
      'c-navigation--narrow-small': narrow && small,
      'c-navigation--small': small && !narrow,
      'c-navigation--inverted': inverted,
      'c-navigation--selected-on-exact-active': selectedOnExactActive,
    }"
  >
    <h2 class="u-visually-hidden">{{ name }}</h2>
    <ul v-click-outside="closeAllMenuItems" class="u-unstyled-list c-navigation__list">
      <li
        v-for="(item, itemIndex) in items"
        :key="itemIndex"
        class="c-navigation__item-group"
        :class="{ 'c-navigation__item-group--open': openStates[itemIndex] }"
      >
        <a v-if="item.isExternal" :href="item.href" class="u-unstyled-button c-navigation__item-name">
          {{ item.name }}
        </a>
        <component
          :is="item.href ? 'nuxt-link' : 'button'"
          v-else
          :to="item.href ? localePath(item.href) : undefined"
          :aria-haspopup="item.children && !!item.children.length"
          :aria-expanded="openStates[itemIndex]"
          class="u-unstyled-button c-navigation__item-name"
          @click.stop="onItemClickStop(item, itemIndex)"
          @click.native="onItemClickNative(item)"
        >
          {{ item.name }}
        </component>
        <ul
          v-if="item.children && item.children.length"
          v-show="openStates[itemIndex]"
          class="u-unstyled-list c-navigation__sub-items"
          :class="{
            'c-navigation__sub-items--active': item.children.some(
              (subItem) => subItem.href && $route.path.startsWith(localePath(subItem.href))
            ),
            [$route.path]: true,
          }"
        >
          <li v-for="(subItem, subItemIndex) in item.children" :key="subItemIndex" class="c-navigation__sub-item">
            <nuxt-link
              :to="subItem.href ? localePath(subItem.href) : undefined"
              @click.native="onItemClickNative(subItem)"
            >
              {{ subItem.name }}
            </nuxt-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import vClickOutside from 'v-click-outside';
import { MenuItem } from '~/store/state';

export default defineComponent({
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    /**
     * Name of the navigation, visible to screen readers.
     */
    name: {
      type: String,
      required: true,
    },
    /**
     * Alternative layout to be used in the drawer.
     */
    narrow: Boolean,
    /**
     * Alternative layout for sub-navigation.
     */
    small: Boolean,
    /**
     * Invert colours of navigation.
     */
    inverted: Boolean,
    items: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
    selectedOnExactActive: Boolean,
  },
  data() {
    return {
      openStates: [] as boolean[],
    };
  },
  created() {
    this.closeAllMenuItems();
  },
  methods: {
    toggleMenuItem(itemIndex: number) {
      if (this.openStates[itemIndex]) {
        this.$set(this.openStates, itemIndex, false);
      } else {
        this.openStates.forEach((_openState, index) => {
          this.$set(this.openStates, index, index === itemIndex);
        });
      }
    },
    closeAllMenuItems() {
      this.openStates = this.items.map(() => false);
    },
    onItemClickStop(item: MenuItem, index: number) {
      if (!item.href) {
        // No `item.href` means this is a `button`
        this.toggleMenuItem(index);
      }
    },
    onItemClickNative(item: MenuItem) {
      if (item.href) {
        // `item.href` set means this is a link
        this.$emit('navigate');

        if (!this.narrow) {
          this.closeAllMenuItems();
        }
      }
    },
  },
});
</script>

<style scoped>
.c-navigation__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--st-length-spacing-xs);

  /* Translate to have the navigation aligned when not hovered */
  transform: translateX(-0.5rem);
}

.c-navigation--narrow-small {
  font-size: 0.9rem;
}

.c-navigation--narrow .c-navigation__list {
  flex-direction: column;
  align-items: flex-start;
  transform: none;
}

.c-navigation--narrow-small .c-navigation__list {
  row-gap: var(--st-length-spacing-xxs);
}

.c-navigation--small .c-navigation__list {
  column-gap: var(--st-length-spacing-s);
  transform: none;
}

.c-navigation--inverted .c-navigation__list {
  background-color: black;
  padding: var(--st-length-spacing-xxs) var(--st-length-main-content-side-padding);
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
  width: calc(100% + 2 * var(--st-length-main-content-side-padding));
  gap: var(--st-length-spacing-xxs);
}

.c-navigation__item-group {
  position: relative;
}

.c-navigation__item-name {
  display: inline-block;
  cursor: pointer;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 1em;
  padding: 0.5rem;
  border-radius: 5px;
  font-weight: 900;
  color: var(--st-color-wide-navigation-item);
  position: relative;
  transition: background-color 0.25s ease;
  touch-action: manipulation;
}

.c-navigation--small .c-navigation__item-name {
  text-transform: none;
  padding: 0;
  border-radius: 0;
}

.c-navigation--inverted .c-navigation__item-name {
  color: white;
  padding: var(--st-length-spacing-xxs);
}

.c-navigation__item-group--open .c-navigation__item-name,
.c-navigation__item-name:hover {
  background-color: var(--st-color-wide-navigation-item-active-background);
}

.c-navigation--small .c-navigation__item-name:hover {
  background-color: transparent;
}

.c-navigation--inverted .c-navigation__item-group--open .c-navigation__item-name,
.c-navigation--inverted .c-navigation__item-name:hover {
  color: var(--st-color-navigation-item-inverted-hover);
  background-color: transparent;
}

.c-navigation:not(.c-navigation--selected-on-exact-active) .c-navigation__item-name.nuxt-link-active::after,
.c-navigation--selected-on-exact-active .c-navigation__item-name.nuxt-link-exact-active::after,
.c-navigation__item-name:has(+ .c-navigation__sub-items--active)::after {
  content: '';
  display: block;
  width: 100%;
  border-bottom: 4px solid var(--st-color-wide-navigation-item-active-border);
  position: absolute;
  bottom: -4px;
  left: 0;
}

.c-navigation--inverted .c-navigation__item-name.nuxt-link-active,
.c-navigation--inverted .c-navigation__item-name:has(+ .c-navigation__sub-items--active) {
  background-color: var(--st-color-navigation-item-inverted-active-background);
  border-radius: var(--st-length-spacing-xxs);
}

.c-navigation--inverted .c-navigation__item-name.nuxt-link-active:hover,
.c-navigation--inverted .c-navigation__item-name:has(+ .c-navigation__sub-items--active):hover {
  color: white;
}

.c-navigation--small .c-navigation__item-name:hover:not(.nuxt-link-active)::after {
  content: '';
  display: block;
  width: 100%;
  border-bottom: 4px solid var(--st-color-small-navigation-item-hover-border);
  position: absolute;
  bottom: -4px;
  left: 0;
}

.c-navigation.c-navigation--inverted .c-navigation__item-name.nuxt-link-active::after,
.c-navigation.c-navigation--inverted .c-navigation__item-name:has(+ .c-navigation__sub-items--active)::after,
.c-navigation.c-navigation--inverted .c-navigation__item-name:hover:not(.nuxt-link-active)::after,
.c-navigation--selected-on-exact-active .c-navigation--narrow .c-navigation__item-name.nuxt-link-active::after,
.c-navigation--selected-on-exact-active .c-navigation--inverted .c-navigation__item-name.nuxt-link-active::after,
.c-navigation:not(.c-navigation--selected-on-exact-active)
  .c-navigation--narrow
  .c-navigation__item-name.nuxt-link-active::after {
  content: none;
}

.c-navigation__sub-items {
  background-color: var(--st-color-wide-navigation-sub-items-background);
  backdrop-filter: blur(5px); /* Does not work yet on Firefox, but that's okay as it's only nice to have */
  box-shadow: var(--st-shadow-navigation);
  border-radius: 5px;
  position: absolute;
  top: 2.5rem;
  left: 0;
  padding: var(--st-length-spacing-xs);
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, auto);
  column-gap: 1.5rem;
  z-index: 2;
}

.c-navigation--narrow .c-navigation__sub-items {
  background-color: transparent;
  backdrop-filter: none;
  box-shadow: none;
  position: static;
  display: flex;
  flex-direction: column;
}

.c-navigation__sub-item {
  white-space: nowrap;
}

.c-navigation__sub-item a {
  text-decoration: none;
  color: var(--st-color-wide-navigation-item);
  display: inline-block;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
}

.c-navigation__sub-item a.nuxt-link-active {
  color: var(--st-color-wide-navigation-narrow-sub-item-active);
}

.c-navigation__sub-item a:hover,
.c-navigation__sub-item a:active {
  background-color: var(--st-color-wide-navigation-item-active-background);
}

.c-navigation--narrow .c-navigation__sub-item a:active {
  background-color: var(--st-color-wide-navigation-narrow-sub-item-active-background);
}

@media (--lg-and-up) {
  .c-navigation__list {
    column-gap: var(--st-length-spacing-s);
  }
}
</style>
