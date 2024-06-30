<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="c-icon"
    :viewBox="viewBox"
    :width="width"
    :height="height"
    :aria-labelledby="iconName"
    role="presentation"
    fill="none"
  >
    <title v-if="iconName" :id="iconName" lang="en">{{ iconName }} icon</title>
    <g :fill="iconColor">
      <slot />
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = defineProps({
  iconName: {
    type: String,
    default: null,
  },
  width: {
    type: [Number, String],
    default: 24,
  },
  height: {
    type: [Number, String],
    default: 24,
  },
  iconColor: {
    type: String,
    default: null,
  },
  viewBoxWidth: {
    type: [Number, String],
    default: null,
  },
  viewBoxHeight: {
    type: [Number, String],
    default: null,
  },
});

const viewBox = computed(() => {
  if (props.viewBoxWidth && props.viewBoxHeight) {
    return `0 0 ${props.viewBoxWidth} ${props.viewBoxHeight}`;
  } else {
    return `0 0 ${props.width} ${props.height}`;
  }
});
</script>

<style>
.c-icon path,
.c-icon circle,
.c-icon rect,
.c-icon line {
  vector-effect: non-scaling-stroke;
}
</style>
