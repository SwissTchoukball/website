<template>
  <component
    :is="elementType"
    :type="buttonType"
    :to="to"
    :href="href || to"
    :disabled="disabled"
    v-bind="$attrs"
    class="u-unstyled-button c-button"
    :class="{ 'c-button--narrow': narrow, 'c-button--primary': primary }"
  >
    <slot></slot>
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
  href: {
    type: String,
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  primary: {
    type: Boolean,
    default: false,
  },
  narrow: {
    type: Boolean,
    default: false,
  },
});

const elementType = computed(() => {
  if (props.to) {
    return NuxtLink;
  } else if (props.href) {
    return 'a';
  }

  return 'button';
});

const buttonType = computed(() => {
  if (!props.to && !props.href) {
    return props.type;
  }

  return null;
});
</script>

<style scoped>
.c-button {
  height: 2.6rem;
  min-width: 7.5rem;
  background: var(--st-color-button-base-background);
  border: 1px solid var(--st-color-button-base-border);
  color: var(--st-color-button-base-text);
  border-radius: 1.3rem;
  font-weight: bold;
  font-size: 1em;
  padding: 0 1rem;
}

.c-button:hover,
.c-button:focus {
  background-color: var(--st-color-button-base-background-hover);
  border-color: var(--st-color-button-base-border-hover);
  outline: 0;
}

.c-button:disabled {
  color: var(--st-color-button-base-text-disabled);
  border-color: var(--st-color-button-base-border-disabled);
}

.c-button:not(:disabled) {
  cursor: pointer;
}

a.c-button {
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.c-button--primary {
  border-color: transparent;
  background-color: var(--st-color-button-primary-background);
  color: var(--st-color-button-primary-text);
}

.c-button--primary:hover,
.c-button--primary:focus {
  background-color: var(--st-color-button-primary-background-hover);
  border-color: transparent;
}

.c-button--primary:disabled {
  color: var(--st-color-button-primary-text-disabled);
  background-color: var(--st-color-button-primary-background-disabled);
  border-color: transparent;
}

.c-button--narrow {
  height: 1.5rem;
  font-size: 0.8em;
}
</style>
