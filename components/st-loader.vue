<template functional>
  <div class="c-loader" :class="{ 'c-loader--main': props.main }">
    <span class="c-loader__stripe c-loader__strip--vertical"></span>
    <span class="c-loader__stripe c-loader__strip--hotizontal"></span>
  </div>
</template>

<style scoped>
.c-loader {
  width: 64px;
  height: 64px;
  background: var(--st-color-loader-background);
  border-radius: 10px;
  animation: square-spin 1.2s infinite ease-in-out;
}

.c-loader--main {
  margin: auto;
  margin-top: var(--st-length-spacing-m);
}

.c-loader__stripe {
  position: absolute;
  background-color: var(--st-color-loader-foreground);
  display: block;
}

.c-loader__strip--vertical {
  margin-top: 12px;
  height: 40px;
  width: 12px;
  margin-left: 26px;
}

.c-loader__strip--hotizontal {
  width: 40px;
  height: 12px;
  margin-left: 12px;
  margin-top: 26px;
}

@keyframes square-spin {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }

  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }
}
</style>
