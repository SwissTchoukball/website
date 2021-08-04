<template>
  <nav class="c-main-navigation" :class="{ 'c-main-navigation--narrow': narrow }">
    <h2 class="u-visually-hidden">{{ $t('mainNavigation') }}</h2>
    <ul v-click-outside="closeAllMenuItems" class="u-unstyled-list c-main-navigation__list">
      <li
        v-for="(item, itemIndex) in mainNavigation"
        :key="itemIndex"
        class="c-main-navigation__item-group"
        :class="{ 'c-main-navigation__item-group--open': item.open }"
      >
        <component
          :is="item.to ? 'nuxt-link' : 'button'"
          :to="item.to"
          class="u-unstyled-button c-main-navigation__item-name"
          @click.stop="onItemClickStop(item, itemIndex)"
          @click.native="onItemClickNative(item)"
        >
          {{ item.name }}
        </component>
        <ul v-if="item.open && item.children" class="u-unstyled-list c-main-navigation__sub-items">
          <li v-for="(subItem, subItemIndex) in item.children" :key="subItemIndex" class="c-main-navigation__sub-item">
            <nuxt-link :to="subItem.to" @click.native="onItemClickNative(subItem)">{{ subItem.name }}</nuxt-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import vClickOutside from 'v-click-outside';

export default Vue.extend({
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    /**
     * Alternative layout of the navigation to be used in the drawer.
     */
    narrow: Boolean,
  },
  data() {
    return {
      mainNavigation: [
        {
          name: 'Fédération',
          open: false,
          children: [
            {
              name: 'À propos',
              to: '/inspire',
            },
            {
              name: 'Clubs',
              to: '/clubs',
            },
            {
              name: 'Associations régionales',
              to: '/associations-regionales',
            },
            {
              name: 'Comité exécutif',
              to: '/clubs',
            },
            {
              name: 'Commissions',
              to: '/clubs',
            },
            {
              name: 'Sponsoring',
              to: '/clubs',
            },
            {
              name: 'Arbitrage',
              to: '/clubs',
            },
            {
              name: 'Juniors',
              to: '/clubs',
            },
            {
              name: 'Tchoukup',
              to: '/clubs',
            },
            {
              name: "S'impliquer",
              to: '/clubs',
            },
          ],
        },
        {
          name: 'Compétitions',
          open: false,
          children: [
            {
              name: 'Championnat',
              to: '/championnat',
            },
            {
              name: 'Coupe suisse',
              to: '/coupe-suisse',
            },
          ],
        },
        {
          name: 'Événements',
          open: false,
          to: '/inspire',
        },
      ],
    };
  },
  methods: {
    toggleMenuItem(itemIndex: number) {
      const toggledItem = this.mainNavigation[itemIndex];
      if (toggledItem.open) {
        toggledItem.open = false;
      } else {
        this.mainNavigation.forEach((item, index) => {
          item.open = index === itemIndex;
        });
      }
    },
    closeAllMenuItems() {
      this.mainNavigation.forEach((item) => {
        item.open = false;
      });
    },
    // TODO: replace any with future interface for menu item
    onItemClickStop(item: any, index: number) {
      if (!item.to) {
        // No `item.to` means this is a `button`
        this.toggleMenuItem(index);
      }
    },
    // TODO: replace any with future interface for menu item
    onItemClickNative(item: any) {
      if (item.to) {
        // `item.to` set means this is a link
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
  font-size: 1rem;
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
