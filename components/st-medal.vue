<template>
  <div class="c-medal" :class="medalVariantClass" :title="$t('nationalTeams.results.rank', { rank }).toString()">
    {{ rank }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    rank: {
      type: Number,
      default: null,
    },
  },
  computed: {
    medalVariantClass() {
      switch (+this.rank) {
        case 1:
          return `c-medal--gold`;
        case 2:
          return `c-medal--silver`;
        case 3:
          return `c-medal--bronze`;
        default:
          return '';
      }
    },
  },
});
</script>

<style scoped>
/* The medal size depends on the font-size.
   The parent element just needs to set the font size for the medal to change its size. */
.c-medal {
  width: 1.5em;
  height: 1.5em;
  border-radius: 100%;
  cursor: pointer;
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #00000060;
  font-weight: 900;
  border: 0.1em solid #00000020;
  flex-shrink: 0; /* In case the medal is in a flex context */
}

.c-medal--gold {
  background: var(--st-color-medal-gold);
  box-shadow: 0 0.09em 0 0 #846900, 0 0 0.5em 0.05em var(--st-color-medal-gold-simple);
}

.c-medal--silver {
  background: var(--st-color-medal-silver);
  box-shadow: 0 0.09em 0 0 #808080, 0 0 0.5em 0.05em var(--st-color-medal-silver-simple);
}

.c-medal--bronze {
  background: var(--st-color-medal-bronze);
  box-shadow: 0 0.09em 0 0 #6d2821, 0 0 0.5em 0.05vmin var(--st-color-medal-bronze-simple);
}
</style>
