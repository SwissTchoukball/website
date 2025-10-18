<template>
  <div class="c-announcements">
    <a
      v-for="announcement of announcements"
      :key="announcement.id"
      :href="announcement.url"
      class="c-announcements__entry"
    >
      <span>
        {{ announcement.description }}
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Announcement } from '~/plugins/08.cms-service';

defineProps({
  announcements: {
    type: Array as PropType<Announcement[]>,
    required: true,
  },
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-announcements {
  display: flex;
  flex-direction: column;
}

.c-announcements__entry {
  display: block;
  text-align: center;
  padding: var(--st-length-spacing-xs) var(--st-length-main-content-side-padding);
  margin-top: var(--st-length-spacing-xxs);
  color: var(--st-color-live-stream-foreground);
  font-weight: bold;
  background-color: var(--st-color-live-stream-background);
  text-decoration: none;
}

@media (--sm-and-up) {
  .c-announcements {
    align-items: center;
  }

  .c-announcements__entry {
    border-radius: 10000px;
  }
}
</style>
