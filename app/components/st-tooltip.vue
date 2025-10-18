<template>
  <TooltipRoot :disabled="disabled">
    <TooltipTrigger
      :as="triggerAs"
      class="c-tooltip__trigger u-unstyled-button"
      :class="{ 'c-tooltip__trigger--full-width': fullWidthTrigger }"
    >
      <slot name="trigger" />
    </TooltipTrigger>
    <TooltipContent class="c-tooltip__content" :side="position">
      <slot name="content" />
      <TooltipArrow class="c-tooltip__arrow" :width="8" />
    </TooltipContent>
  </TooltipRoot>
</template>

<script setup lang="ts">
import { TooltipContent, TooltipRoot, TooltipTrigger } from 'radix-vue';

defineProps({
  position: {
    type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
    default: 'top',
  },
  triggerAs: {
    type: String,
    default: undefined,
  },
  fullWidthTrigger: Boolean,
  disabled: Boolean,
});
</script>

<style>
.c-tooltip__trigger--full-width {
  width: 100%;
}

.c-tooltip__content {
  color: var(--st-color-tooltip-foreground);
  background-color: var(--st-color-tooltip-background);
  padding: var(--st-length-spacing-xxs) var(--st-length-spacing-xs);
  border-radius: 5px;
  font-size: 1rem;
  font-weight: normal;
  z-index: 3;
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.c-tooltip__content[data-state='delayed-open'][data-side='top'] {
  animation-name: slide-down-and-fade;
}

.c-tooltip__content[data-state='delayed-open'][data-side='right'] {
  animation-name: slide-left-and-fade;
}

.c-tooltip__content[data-state='delayed-open'][data-side='bottom'] {
  animation-name: slide-up-and-fade;
}

.c-tooltip__content[data-state='delayed-open'][data-side='left'] {
  animation-name: slide-right-and-fade;
}

.c-tooltip__arrow {
  fill: var(--st-color-tooltip-background);
}

@keyframes slide-up-and-fade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-right-and-fade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-down-and-fade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-left-and-fade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
