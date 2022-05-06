<template>
  <nav>
    <h2 class="u-visually-hidden">{{ $t('breadcrumb') }}</h2>
    <ol class="u-unstyled-list c-breadcrumb__list">
      <li class="c-breadcrumb__item">
        <nuxt-link :to="localePath('index')" class="c-breadcrumb__link" :title="$t('backHome')">
          {{ $t('breadcrumb.home') }}
        </nuxt-link>
      </li>
      <li v-for="item of items" :key="item.pageName" class="c-breadcrumb__item">
        <nuxt-link :to="localePath(item.pageName)" class="c-breadcrumb__link">{{ item.displayName }}</nuxt-link>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export interface BreadcrumbItem {
  pageName: string;
  displayName: string;
}

export default Vue.extend({
  props: {
    items: {
      type: Array as PropType<BreadcrumbItem[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.c-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5em;
  row-gap: 0.5em;
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
