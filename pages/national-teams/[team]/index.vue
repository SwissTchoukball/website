<template>
  <div></div>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
const route = useRoute();

navigateTo(localePath({ name: 'national-teams-team-players', params: { team: route.params.team } }));
</script>
