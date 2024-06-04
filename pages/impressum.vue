<template>
  <st-simple-page :title="title" :body="body" :key-roles="keyRoles" :resources="resources" />
</template>

<script setup lang="ts">
const { fetchPage, title, body, keyRoles, resources } = useCatchAll();

fetchPage();
</script>
