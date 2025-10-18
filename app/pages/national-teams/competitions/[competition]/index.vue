<template>
  <div></div>
</template>

<script setup lang="ts">
const router = useRouter();

defineI18nRoute({
  paths: {
    fr: '/equipes-nationales/competitions/[competition]',
    de: '/nationalteams/wettbewerbe/[competition]',
  },
});

const props = defineProps({
  navigation: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
});

if (props.navigation[0]?.href) {
  router.push(props.navigation[0].href);
} else {
  console.warn('No navigation to redirect to');
}
</script>
