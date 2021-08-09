<template>
  <ul class="u-unstyled-list">
    <li v-for="category of categories" :key="`category-${category.id}`" class="c-news-category-labels__category">
      <nuxt-link :to="getCategoryLink(category)" class="c-news-category-labels__category-link">
        {{ category.name }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { NewsCategory } from './st-news';

export default Vue.extend({
  props: {
    categories: {
      type: Array as PropType<NewsCategory[]>,
      required: true,
    },
  },
  methods: {
    getCategoryLink(category: NewsCategory) {
      return this.localePath({ name: 'news', query: { category: category.id.toString() } });
    },
  },
});
</script>

<style scoped>
.c-news-category-labels__category {
  display: inline-block;
  margin-right: 0.3em;
}
.c-news-category-labels__category-link {
  color: var(--st-color-news-category-foreground);
  background-color: var(--st-color-news-category-background);
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 900;
  font-size: 0.8em;
  padding: 0.2em 0.3em;
}
</style>
