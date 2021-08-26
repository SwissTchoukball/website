<template>
  <ul class="u-unstyled-list">
    <li v-for="domain of domains" :key="`domain-${domain.id}`" class="c-news-domain-labels__domain">
      <nuxt-link :to="getNewsDomainLink(domain)" class="c-news-domain-labels__domain-link">
        {{ domain.name }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Domain from '~/models/domain.model';

export default Vue.extend({
  props: {
    domains: {
      type: Array as PropType<Domain[]>,
      required: true,
    },
  },
  methods: {
    getNewsDomainLink(domain: Domain) {
      return this.localePath({ name: 'news', query: { domain: domain.id.toString() } });
    },
  },
});
</script>

<style scoped>
.c-news-domain-labels__domain {
  display: inline-block;
  margin-right: 0.3em;
}
.c-news-domain-labels__domain-link {
  color: var(--st-color-news-domain-foreground);
  background-color: var(--st-color-news-domain-background);
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 900;
  font-size: 0.8em;
  padding: 0.2em 0.3em;
}
</style>
