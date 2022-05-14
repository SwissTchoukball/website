<template>
  <div class="c-cancelled-label">{{ $t('events.cancelled') }}</div>
</template>

<style scoped>
.c-cancelled-label {
  display: inline-block;
  font-size: 0.6em;
  color: var(--st-color-event-cancelled-label);
  text-transform: uppercase;
  font-weight: bold;
  border: 0.2rem solid var(--st-color-event-cancelled-label);
  border-radius: 0.5em;
  padding: calc(var(--st-length-spacing-xxs) / 2) var(--st-length-spacing-xxs);
}
</style>
