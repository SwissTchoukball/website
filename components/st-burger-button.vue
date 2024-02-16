<template>
  <button
    class="c-burger-button__icon u-unstyled-button"
    :class="{ 'c-burger-button__icon--open': open }"
    @click.stop="$emit('toggle', !open)"
  >
    <span class="c-burger-button__icon-element"></span>
    <span class="c-burger-button__icon-element"></span>
    <span class="c-burger-button__icon-element"></span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  model: {
    prop: 'open',
    event: 'toggle',
  },
  props: {
    open: Boolean,
  },
});
</script>

<style scoped>
.c-burger-button__icon {
  width: 30px;
  height: 20px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
  cursor: pointer;
  touch-action: manipulation;
}

.c-burger-button__icon .c-burger-button__icon-element {
  display: block;
  position: absolute;
  height: 3px;
  width: 100%;
  background-color: var(--st-color-burger-menu);
  border-radius: 3px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.c-burger-button__icon .c-burger-button__icon-element:nth-child(1) {
  top: 0;
  transform-origin: left center;
}

.c-burger-button__icon .c-burger-button__icon-element:nth-child(2) {
  top: 8px;
  transform-origin: left center;
}

.c-burger-button__icon .c-burger-button__icon-element:nth-child(3) {
  top: 16px;
  transform-origin: left center;
}

.c-burger-button__icon--open .c-burger-button__icon-element:nth-child(1) {
  transform: rotate(45deg);
  top: -3px;
  left: 8px;
}

.c-burger-button__icon--open .c-burger-button__icon-element:nth-child(2) {
  width: 0%;
  opacity: 0;
}

.c-burger-button__icon--open .c-burger-button__icon-element:nth-child(3) {
  transform: rotate(-45deg);
  top: 15px;
  left: 8px;
}
</style>
