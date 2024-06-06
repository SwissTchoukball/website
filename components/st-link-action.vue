<template>
  <component :is="elementType" :type="buttonType" :to="to" v-bind="$attrs" class="u-unstyled-button c-link-action">
    <template v-if="withCross"><font-awesome-icon icon="xmark" /></template>
    <slot></slot>
    <template v-if="withArrow">&rarr;</template>
    <template v-if="withArrowDown">&darr;</template>
  </component>
</template>

<script setup lang="ts">
const NuxtLink = resolveComponent('NuxtLink');

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  to: {
    type: String,
    required: false,
    default: null,
  },
  withArrow: Boolean,
  withArrowDown: Boolean,
  withCross: Boolean,
});
const elementType = computed(() => {
  if (props.to) {
    return NuxtLink;
  }

  return 'button';
});

const buttonType = computed(() => {
  if (!props.to) {
    return props.type;
  }

  return null;
});
</script>

<style scoped>
.c-link-action {
  color: var(--st-color-link, black);
  text-decoration: underline;
  cursor: pointer;
}
</style>
