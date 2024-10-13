<template>
  <div class="c-chip">
    <slot />
  </div>
</template>

<style scoped>
.c-chip {
  display: inline-block;
  font-size: 0.6rem;
  padding: 0.3rem 0.8rem;
  border-radius: 50rem;
  background-color: var(--st-color-match-additional-info-background);
}
</style>
