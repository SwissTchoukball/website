<template>
  <nav>
    <h2 class="u-visually-hidden">{{ $t('breadcrumb.title') }}</h2>
    <ol class="u-unstyled-list c-breadcrumb__list">
      <li class="c-breadcrumb__item">
        <nuxt-link :to="localePath('index')" class="c-breadcrumb__link" :title="$t('backHome')">
          {{ $t('breadcrumb.home') }}
        </nuxt-link>
      </li>
      <li v-for="item of items" :key="item.pageName || item.displayName" class="c-breadcrumb__item">
        <nuxt-link
          v-if="item.pageName"
          :to="localePath({ name: item.pageName, params: item.pageParams })"
          class="c-breadcrumb__link"
        >
          {{ item.displayName }}
        </nuxt-link>
        <span v-else class="c-breadcrumb__link">{{ item.displayName }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
const localePath = useLocalePath();

export interface BreadcrumbItem {
  pageName?: string;
  pageParams?: Record<string, string>;
  displayName: string;
}

defineProps({
  items: {
    type: Array as PropType<BreadcrumbItem[]>,
    required: true,
  },
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.c-breadcrumb__item {
  display: flex;
  align-items: center;
  column-gap: 0.5em;
  max-width: 100%;
}

.c-breadcrumb__item + .c-breadcrumb__item::before {
  content: '';
  flex-shrink: 0;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-top: 2px solid var(--st-color-breadcrumb-separation);
  border-right: 2px solid var(--st-color-breadcrumb-separation);
  transform: rotate(45deg);
}

.c-breadcrumb__link {
  display: flex;
  font-size: 0.9rem;
  color: var(--st-color-text-lighter);
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
}

.c-breadcrumb__link:hover {
  text-decoration: none;
}

@media (--sm-and-up) {
  .c-breadcrumb__list,
  .c-breadcrumb__item {
    column-gap: 1em;
  }
}
</style>
