<template>
  <span class="c-live-indicator">
    <span class="c-live-indicator__dot"></span>
    <span class="c-live-indicator__outer-glow"></span>
  </span>
</template>

<style>
:root {
  --st-color-live-indicator: var(--st-color-red-swiss-tchoukball);
  --st-size-live-indicator: 32px;
  --st-scale-live-indicator-dot: 0.6;
}
</style>

<style scoped>
.c-live-indicator {
  display: inline-block;
  position: relative;
  width: var(--st-size-live-indicator);
  height: var(--st-size-live-indicator);
}

.c-live-indicator__dot {
  width: calc(var(--st-size-live-indicator) * var(--st-scale-live-indicator-dot));
  height: calc(var(--st-size-live-indicator) * var(--st-scale-live-indicator-dot));
  border-radius: 50%;
  background: var(--st-color-live-indicator);
  display: inline-block;
  position: absolute;
  top: calc(var(--st-size-live-indicator) * (1 - var(--st-scale-live-indicator-dot)) / 2);
  left: calc(var(--st-size-live-indicator) * (1 - var(--st-scale-live-indicator-dot)) / 2);
}

.c-live-indicator__outer-glow {
  width: var(--st-size-live-indicator);
  height: var(--st-size-live-indicator);
  display: inline-block;
  position: absolute;
}

.c-live-indicator__outer-glow::after,
.c-live-indicator__outer-glow::before {
  content: '';
  box-sizing: border-box;
  width: var(--st-size-live-indicator);
  height: var(--st-size-live-indicator);
  border-radius: 50%;
  background: var(--st-color-live-indicator);
  position: absolute;
  left: 0;
  top: 0;
  animation: animloader 3s linear infinite;
}

.c-live-indicator__outer-glow::after {
  animation-delay: 1.5s;
}

@keyframes animloader {
  0% {
    transform: scale(0.2);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
