<template>
  <div class="c-index">
    <NuxtLogo />
    <h2>Welcome to the Nuxt.js template</h2>
    <div>
      <a href="https://nuxtjs.org/" target="_blank" rel="noopener noreferrer"> Nuxt Documentation </a>
      <br />
      <a href="https://github.com/nuxt/nuxt.js" target="_blank" rel="noopener noreferrer"> Nuxt GitHub </a>
    </div>
    <div>
      <nuxt-link to="/inspire"> Continue </nuxt-link>
    </div>
  </div>
</template>

<style scoped>
.c-index {
  padding-top: var(--st-length-spacing-m);
}
</style>
