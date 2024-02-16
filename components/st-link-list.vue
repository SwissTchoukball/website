<template>
  <nav>
    <h2 class="u-visually-hidden">{{ name }}</h2>
    <ul class="c-link-list">
      <li v-for="item in items" :key="item.name.toString()" class="c-link-list-item">
        <nuxt-link :to="item.href">
          {{ item.name }}
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MenuItem } from '~/store/state';

export default defineComponent({
  props: {
    /**
     * Name of the navigation, visible to screen readers.
     */
    name: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
  },
});
</script>

<style scoped>
.c-link-list-item {
  margin-top: var(--st-length-spacing-xs);
  text-indent: 1rem;
  font-weight: bold;
}

.c-link-list {
  padding-left: 0.8rem;
}

.c-link-list-item a {
  text-decoration: none;
}

.c-link-list-item::marker {
  content: '\2726';
}
</style>
