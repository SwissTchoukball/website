<template>
  <div class="c-resource-list-item">
    <fa-icon :icon="iconName" class="c-resource-list-item__icon" />
    <div class="c-resource-list-item__name-details">
      <a v-if="resource.link" :href="href">{{ fileName }}</a>
      <nuxt-link
        v-else
        class="c-resource-list-item__name"
        :to="localePath({ name: 'resources-slug', params: { slug: `${resource.id}-${$slugify(resource.name)}` } })"
      >
        {{ fileName }}
      </nuxt-link>
      <st-resource-details :resource="resource" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import resourceMixin from '~/mixins/resource.mixin';
import stResourceDetails from '~/components/resources/st-resource-details.vue';

export default defineComponent({
  components: {
    stResourceDetails,
  },
  mixins: [resourceMixin],
});
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
