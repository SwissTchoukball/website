<template>
  <component
    :is="elementType"
    :type="buttonType"
    :to="to"
    :href="href || to"
    v-bind="$attrs"
    class="u-unstyled-button c-link-action"
    v-on="$listeners"
  >
    <template v-if="withCross"><fa-icon icon="times" /></template>
    <slot></slot>
    <template v-if="withArrow">&rarr;</template>
    <template v-if="withArrowDown">&darr;</template>
  </component>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
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
    withArrow: Boolean,
    withArrowDown: Boolean,
    withCross: Boolean,
  },
  computed: {
    elementType() {
      if (this.to) {
        return 'nuxt-link';
      } else if (this.href) {
        return 'a';
      }

      return 'button';
    },
    buttonType() {
      if (!this.to && !this.href) {
        return this.type;
      }

      return null;
    },
  },
});
</script>

<style scoped>
.c-link-action {
  color: var(--st-color-link, black);
  text-decoration: underline;
  cursor: pointer;
}
</style>
