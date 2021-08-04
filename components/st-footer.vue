<template>
  <footer class="st-footer">
    <section class="l-main-content-section">
      <span>&copy; {{ new Date().getFullYear() }} {{ $t('title') }}</span>
    </section>
  </footer>
</template>

<style scoped>
.st-footer {
  margin-top: var(--st-length-spacing-m);
  text-align: center;
}
</style>
