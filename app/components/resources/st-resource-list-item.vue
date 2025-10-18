<template>
  <div class="c-resource-list-item">
    <font-awesome-icon :icon="iconName" class="c-resource-list-item__icon" />
    <div class="c-resource-list-item__name-details">
      <a v-if="resource.link" :href="href">{{ fileName }}</a>
      <nuxt-link
        v-else
        class="c-resource-list-item__name"
        :to="localePath({ name: 'resources-slug', params: { slug: `${resource.id}-${slugify(resource.name)}` } })"
      >
        {{ fileName }}
      </nuxt-link>
      <st-resource-details :resource="resource" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResource } from '~/composables/useResource';
import type { Resource } from '~/plugins/08.cms-service';

const localePath = useLocalePath();
const { slugify } = useSlugify();

const props = defineProps({
  resource: {
    type: Object as PropType<Resource>,
    required: true,
  },
});

const { href, fileName, iconName } = useResource(props.resource);
</script>

<style scoped>
.c-resource-list-item {
  display: flex;
  align-items: center;
}

.c-resource-list-item__icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.2rem;
  margin-right: var(--st-length-spacing-xxs);
  color: var(--st-color-resource-icon);
  flex-shrink: 0;
}

.c-resource-list-item__name {
  color: var(--st-color-link);
  display: inline-block;
}
</style>
