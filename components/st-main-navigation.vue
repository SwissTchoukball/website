<template>
  <nav class="c-main-navigation" :class="{ 'c-main-navigation--narrow': narrow }">
    <h2 class="u-visually-hidden">{{ $t('mainNavigation') }}</h2>
    <ul v-click-outside="closeAllMenuItems" class="u-unstyled-list c-main-navigation__list">
      <li
        v-for="(item, itemIndex) in items"
        :key="itemIndex"
        class="c-main-navigation__item-group"
        :class="{ 'c-main-navigation__item-group--open': openStates[itemIndex] }"
      >
        <component
          :is="item.href ? 'nuxt-link' : 'button'"
          :to="localePath(item.href)"
          class="u-unstyled-button c-main-navigation__item-name"
          @click.stop="onItemClickStop(item, itemIndex)"
          @click.native="onItemClickNative(item)"
        >
          {{ item.name }}
        </component>
        <ul v-if="openStates[itemIndex] && item.children" class="u-unstyled-list c-main-navigation__sub-items">
          <li v-for="(subItem, subItemIndex) in item.children" :key="subItemIndex" class="c-main-navigation__sub-item">
            <nuxt-link :to="localePath(subItem.href)" @click.native="onItemClickNative(subItem)">{{
              subItem.name
            }}</nuxt-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import vClickOutside from 'v-click-outside';
import { MenuItem } from '~/store/state';

export default Vue.extend({
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    /**
     * Alternative layout of the navigation to be used in the drawer.
     */
    narrow: Boolean,
    items: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
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
.c-main-navigation__list {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.c-main-navigation--narrow .c-main-navigation__list {
  flex-direction: column;
  align-items: flex-start;
}

.c-main-navigation__item-group {
  position: relative;
}

.c-main-navigation__item-name {
  display: inline-block;
  cursor: pointer;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 1em;
  padding: 0.5rem;
  border-radius: 5px;
  font-weight: 900;
  color: var(--st-color-wide-navigation-item);
  margin-right: var(--st-length-spacing-xs);
  position: relative;
  transition: background-color 0.25s ease;
  touch-action: manipulation;
}

.c-main-navigation__item-group--open .c-main-navigation__item-name,
.c-main-navigation__item-name:hover {
  background-color: var(--st-color-wide-navigation-item-active-background);
}

.c-main-navigation__item-name.nuxt-link-active::after {
  content: '';
  display: block;
  width: 100%;
  border-bottom: 4px solid var(--st-color-wide-navigation-item-active-border);
  position: absolute;
  bottom: -4px;
  left: 0;
}

.c-main-navigation--narrow .c-main-navigation__item-name.nuxt-link-active::after {
  content: none;
}

.c-main-navigation__sub-items {
  background-color: var(--st-color-wide-navigation-sub-items-background);
  backdrop-filter: blur(5px); /* Does not work yet on Firefox, but that's okay as it's only nice to have */
  box-shadow: rgba(100, 100, 111, 0.2) 0 7px 29px 0;
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

.c-main-navigation--narrow .c-main-navigation__sub-items {
  background-color: transparent;
  backdrop-filter: none;
  box-shadow: none;
  position: static;
  display: flex;
  flex-direction: column;
}

.c-main-navigation__sub-item {
  white-space: nowrap;
}

.c-main-navigation__sub-item a {
  text-decoration: none;
  color: var(--st-color-wide-navigation-item);
  display: inline-block;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
}
.c-main-navigation__sub-item a:hover,
.c-main-navigation__sub-item a:active {
  background-color: var(--st-color-wide-navigation-item-active-background);
}

.c-main-navigation--narrow .c-main-navigation__sub-item a:active {
  background-color: var(--st-color-wide-navigation-narrow-sub-item-active-background);
}

@media (--lg-and-up) {
  .c-main-navigation__item-name {
    margin-right: var(--st-length-spacing-s);
  }
}
</style>
