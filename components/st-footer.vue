<template>
  <footer class="st-footer">
    <section class="l-main-content-section">
      <p>&copy; {{ new Date().getFullYear() }} {{ $t('title') }}</p>
    </section>
  </footer>
</template>

<style scoped>
.st-footer {
  margin-top: var(--st-length-spacing-m);
  padding-bottom: var(--st-length-spacing-s);
  text-align: center;
}
</style>
