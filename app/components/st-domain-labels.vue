<template>
  <ul class="u-unstyled-list">
    <li v-for="domain of domains" :key="`domain-${domain.id}`" class="c-domain-labels__domain">
      <nuxt-link :to="getNewsDomainLink(domain)" class="c-domain-labels__domain-link">
        {{ domain.name }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Domain } from '~/plugins/08.cms-service';

const localePath = useLocalePath();

const props = defineProps({
  domains: {
    type: Array as PropType<Domain[]>,
    required: true,
  },
  targetPageName: {
    type: String,
    required: true,
  },
  targetPageQueryKey: {
    type: String,
    default: 'domain',
  },
});

const getNewsDomainLink = (domain: Domain) => {
  return localePath({ name: props.targetPageName, query: { [props.targetPageQueryKey]: domain.id.toString() } });
};
</script>

<style scoped>
.c-domain-labels__domain {
  display: inline-block;
  margin-right: 0.3em;
}

.c-domain-labels__domain-link {
  color: var(--st-color-domain-foreground);
  background-color: var(--st-color-domain-background);
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 900;
  font-size: 0.8em;
  padding: 0.2em 0.3em;
}
</style>
