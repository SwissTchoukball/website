<template>
  <div class="c-resource">
    <st-domain-labels
      :domains="domains"
      target-page-name="resources"
      target-page-query-key="d"
      class="c-resource__domain-labels"
    />
    <h2 class="t-headline-1 c-resource__title">
      {{ resource.name }}
    </h2>
    <st-resource-details :resource="resource" />

    <st-button
      v-if="resource.file"
      class="c-resource__download-button"
      primary
      :href="`${href}?download`"
      :download="download"
    >
      {{ $t('resources.download') }}
    </st-button>

    <st-button v-if="resource.link" class="c-resource__link-button" primary :href="href">
      {{ $t('resources.view') }}
    </st-button>

    <object
      v-if="resource.file && resource.file.type === 'application/pdf'"
      :type="resource.file.type"
      :data="href"
      class="c-resource__embed"
    ></object>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import stResourceDetails from '~/components/resources/st-resource-details.vue';
import resourceMixin from '~/mixins/resource.mixin';

export default defineComponent({
  components: { stResourceDetails },
  mixins: [resourceMixin],
});
</script>

<style scoped>
.c-resource {
  display: flex;
  flex-direction: column;
}

.c-resource__domain-labels {
  margin-top: var(--st-length-spacing-s);
}

.c-resource__title {
  padding-top: var(--st-length-spacing-xs);
}

a.c-resource__download-button,
a.c-resource__link-button {
  align-self: center;
  margin-top: var(--st-length-spacing-s);
}

.c-resource__embed {
  height: 80vh;
  margin-top: var(--st-length-spacing-s);
  border: 1px solid black;
}

/* Hack to target iOS devices only */
@supports (-webkit-touch-callout: none) {
  /* We hide the PDF embed on iOS because it shows only the first page */
  .c-resource__embed {
    display: none;
  }
}
</style>
