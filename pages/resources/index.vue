<template>
  <section class="l-main-content-section">
    <h2 class="t-headline-1">{{ $t('resources.title') }}</h2>
    <!-- We still specify the form `method` in case JavaScript is disabled. It should work because of SSR -->
    <form class="c-resources__form" method="get" @submit.prevent="submitSearch">
      <div class="c-resources__search">
        <input
          v-model="searchTerm"
          name="q"
          type="search"
          :placeholder="`${$t('resources.form.placeholder')}`"
          class="c-resources__search-field"
        />
        <button type="submit" class="u-unstyled-button c-resources__search-button" :disabled="isSearching">
          <font-awesome-icon icon="magnifying-glass" class="c-resources__search-icon" />
        </button>
      </div>
      <fieldset class="c-resources__filters">
        <legend class="u-visually-hidden">{{ $t('resources.form.filter') }}</legend>
        <div class="c-resources__filter">
          <label class="c-resources__filter-label">{{ $t('resources.form.domain') }}</label>
          <select v-model="selectedDomain" name="d" class="l-form-select" @change="submitSearch">
            <option value="all">{{ $t('resources.form.all') }}</option>
            <option v-for="domain of domains" :key="domain.id" :value="domain.id">{{ domain.name }}</option>
          </select>
        </div>
        <div class="c-resources__filter">
          <label class="c-resources__filter-label">{{ $t('resources.form.type') }}</label>
          <select v-model="selectedType" name="t" class="l-form-select" @change="submitSearch">
            <option value="all">{{ $t('resources.form.all') }}</option>
            <option v-for="type of types" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
      </fieldset>
      <st-link-action class="c-resources__reset-button" with-cross @click="resetSearchParameters">
        {{ $t('resources.form.reset') }}
      </st-link-action>
    </form>

    <st-loader v-if="isSearching" :main="true" />
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!hasSearchBeenSubmittedOnce" class="l-blank-slate-message">{{ $t('resources.search.tooBroad') }}</p>
    <p v-else-if="resources.length <= 0" class="l-blank-slate-message">{{ $t('resources.search.noResults') }}</p>
    <template v-else>
      <p class="c-resources__results-info">
        {{ $t('resources.search.resultsInfo', { amountResults: resources.length }, resources.length) }}
      </p>
      <st-resource-list :resources="resources" class="c-resources__list" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Domain, Resource, ResourceType } from '~/plugins/08.cms-service';

const ALL_OPTION = 'all';

defineI18nRoute({
  paths: {
    fr: '/ressources',
    de: '/ressourcen',
  },
});

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { $cmsService } = useNuxtApp();
const resourcesStore = useResourcesStore();
const domainsStore = useDomainsStore();

const searchTerm = ref('');
const selectedDomain = ref<number | typeof ALL_OPTION>(ALL_OPTION);
const selectedType = ref<number | typeof ALL_OPTION>(ALL_OPTION);
const hasSearchBeenSubmittedOnce = ref(false);
const isSearching = ref(false);
const errorMessage = ref('');
const resources = ref<Resource[]>([]);

useAsyncData('resourceTypes', async () => {
  // We load the resource types only if we don't have them already
  if (!resourcesStore.resourceTypes?.length) {
    await resourcesStore.loadResourceTypes();
  }
  // We don't need to load the domains because they are loaded in nuxtServerInit (as they are needed in multiple places)
});

useHead(() => {
  return {
    title: t('resources.title').toString(),
    meta: [
      { property: 'og:title', content: t('resources.title').toString() },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('resources.description').toString(),
      },
    ],
  };
});

const domains = computed<Domain[]>(() => {
  return [...domainsStore.domains].sort((a, b) => (a as Domain).name.localeCompare((b as Domain).name, locale.value));
});

const types = computed<ResourceType[]>(() => {
  return resourcesStore.resourceTypes;
});

const domainIdFilter = computed<number | undefined>(() => {
  if (!(typeof selectedDomain.value === 'number')) {
    return undefined;
  }
  return selectedDomain.value;
});

const typeIdFilter = computed<number | undefined>(() => {
  if (!(typeof selectedType.value === 'number')) {
    return undefined;
  }
  return selectedType.value;
});

const submitSearch = async () => {
  if (isSearching.value) {
    // Prevent submit if request is still ongoing
    return;
  }
  hasSearchBeenSubmittedOnce.value = true;

  errorMessage.value = '';

  isSearching.value = true;
  resources.value = [];

  setQueryStrings();

  // Retrieving search results
  try {
    resources.value = await $cmsService.searchResources(searchTerm.value, domainIdFilter.value, typeIdFilter.value);
  } catch (error) {
    errorMessage.value = t('resources.search.error').toString() + error;
  } finally {
    isSearching.value = false;
  }
};

const setQueryStrings = () => {
  router.push({
    query: {
      q: searchTerm.value ? searchTerm.value : undefined,
      d: domainIdFilter.value ? domainIdFilter.value.toString() : undefined,
      t: typeIdFilter.value ? typeIdFilter.value.toString() : undefined,
    },
  });
};

const setParametersFromQueryStrings = () => {
  if (route.query.q && typeof route.query.q === 'string') {
    searchTerm.value = route.query.q;
  }
  if (route.query.d && typeof route.query.d === 'string') {
    selectedDomain.value = parseInt(route.query.d);
  }
  if (route.query.t && typeof route.query.t === 'string') {
    selectedType.value = parseInt(route.query.t);
  }
};

const resetSearchParameters = () => {
  searchTerm.value = '';
  selectedDomain.value = ALL_OPTION;
  selectedType.value = ALL_OPTION;
  setQueryStrings();
};

setParametersFromQueryStrings();

// Directly submitting a search requests if the params are good
if (searchTerm.value.length > 0 || domainIdFilter.value || typeIdFilter.value) {
  submitSearch();
}
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-resources__form {
  margin-top: var(--st-length-spacing-m);
  text-align: center;
}

.c-resources__search {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-resources__search-field {
  font-size: 1.2em;
  border-radius: 1.6em;
  border: none;
  background-color: var(--st-color-form-search-field-background);
  padding: 1.2rem 1.6rem;
  font-family: inherit;
  width: 80vw;
  max-width: 25rem;
  margin-right: var(--st-length-spacing-xs);
}

.c-resources__search-button {
  cursor: pointer;
}

.c-resources__search-icon {
  color: var(--st-color-link);
  width: 2.5rem;
  height: 2.5rem;
}

.c-resources__filters {
  margin-top: var(--st-length-spacing-xs);
  padding: 0;
  border: none;
  display: flex;
  flex-flow: column wrap;
  align-items: stretch;
}

.c-resources__filter {
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: var(--st-length-spacing-xxs);
}

.c-resources__filter-label {
  font-size: 0.7em;
  padding-left: var(--st-length-spacing-xxs);
  margin-bottom: var(--st-length-spacing-xxs);
}

.c-resources__reset-button {
  font-size: 0.8em;
  margin: var(--st-length-spacing-xxs);
}

.c-resources__list {
  margin-top: var(--st-length-spacing-m);
}

@media (--sm-and-up) {
  .c-resources__filters {
    flex-direction: row;
    justify-content: center;
  }

  .c-resources__filter {
    width: auto;
  }
}
</style>
