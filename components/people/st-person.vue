<template>
  <div class="c-person">
    <img
      v-if="avatarAssetId"
      :src="avatarSrc"
      :srcset="avatarSrcSet"
      :alt="$t('person.photoOf', { name })"
      class="c-person__avatar"
    />
    <div v-else class="c-person__avatar">
      <fa-icon icon="user" class="c-person__avatar-placeholder" />
    </div>
    <div class="st-person__description">
      <h4 class="t-headline-3 c-person__name">{{ name }}</h4>
      <p v-if="subName" class="c-person__sub-name">
        {{ subName }}
      </p>
      <p v-else-if="$slots.subName" class="c-person__sub-name">
        <slot name="subName"></slot>
      </p>
      <ul class="c-person__details u-unstyled-list">
        <li v-for="(detail, index) of details" :key="`detail-${index}`" class="c-person__detail">
          <fa-icon :icon="detail.icon" class="c-person__detail-icon" />
          <component :is="detail.href ? 'a' : 'span'" :href="detail.href">{{ detail.text }}</component>
          <div v-if="detail.body" class="directus-formatted-content c-person__detail-body" v-html="detail.body"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { getAssetURL } from '~/plugins/directus';

export interface PersonDetail {
  icon: string;
  text: string;
  body?: string;
  href?: string;
}

export default Vue.extend({
  props: {
    avatarAssetId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    subName: {
      type: String,
      default: null,
    },
    details: {
      type: Array as PropType<PersonDetail[]>,
      default: () => [],
    },
  },
  computed: {
    avatarSrc(): string {
      return getAssetURL(this.$config.cmsURL, this.avatarAssetId, { width: this.$config.avatarAssetsSize[0] });
    },
    avatarSrcSet(): string {
      return `${getAssetURL(this.$config.cmsURL, this.avatarAssetId, { width: this.$config.avatarAssetsSize[1] })} 2x`;
    },
  },
});
</script>

<style scoped>
.c-person {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-person__avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--st-color-person-avatar-background);
  flex-shrink: 0;
}

.c-person__avatar-placeholder {
  color: white;
  width: 100%;
  height: 100%;
  padding: 10%;
  padding-bottom: 0;
}

.st-person__description {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.c-person__sub-name {
  font-weight: bold;
  color: var(--st-color-person-sub-name);
}

.c-person__details {
  margin-top: var(--st-length-spacing-xs);
}

.c-person__detail {
  margin-bottom: var(--st-length-spacing-xxs);
}

.c-person__detail-icon {
  color: var(--st-color-person-detail-icon);
  width: 1em;
  margin-right: var(--st-length-spacing-xxs);
}

.c-person__detail-body {
  font-size: 0.8em;
}

.c-person__detail-body >>> ul {
  padding-left: 1em;
  list-style-type: disc;
}

@media (--sm-and-up) {
  .c-person {
    flex-direction: row;
    align-items: flex-start;
  }

  .st-person__description {
    align-items: flex-start;
  }

  .c-person__avatar {
    margin-right: var(--st-length-spacing-s);
  }

  .c-person__name {
    padding-top: 0;
  }

  .c-person__details {
    width: 100%;
  }
}

@media (--md-and-up) {
  .c-person__avatar {
    width: 200px;
    height: 200px;
  }
}
</style>
