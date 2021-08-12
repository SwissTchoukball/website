<template>
  <component
    :is="elementType"
    :type="buttonType"
    :to="to"
    :href="href || to"
    v-bind="$attrs"
    class="u-unstyled-button c-link-action"
    :class="linkClass"
    v-on="$listeners"
  >
    <slot></slot>
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
  text-align: left;
}
</style>
