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
          minlength="3"
          class="c-resources__search-field"
        />
        <button type="submit" class="u-unstyled-button c-resources__search-button" :disabled="isSearching">
          <fa-icon icon="search" class="c-resources__search-icon" />
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
    <p v-else-if="isSearchTooBroad" class="l-blank-slate-message">{{ $t('resources.search.tooBroad') }}</p>
    <p v-else-if="resources.length <= 0" class="l-blank-slate-message">{{ $t('resources.search.noResults') }}</p>
    <template v-else>
      <p class="c-resources__results-info">
        {{ $tc('resources.search.resultsInfo', resources.length, { amountResults: resources.length }) }}
      </p>
      <st-resource-list :resources="resources" class="c-resources__list" />
    </template>
  </section>
</template>

<script lang="ts">
import { Collection } from '@vuex-orm/core';
import Vue from 'vue';
import stResourceList from '~/components/resources/st-resource-list.vue';
import Domain from '~/models/domain.model';
import ResourceType from '~/models/resource-type.model';
import { Resource } from '~/plugins/cms-service';

const ALL_OPTION = 'all';

export default Vue.extend({
  components: { stResourceList },
  data() {
    return {
      searchTerm: '',
      selectedDomain: ALL_OPTION as number | typeof ALL_OPTION,
      selectedType: ALL_OPTION as number | typeof ALL_OPTION,
      isSearchTooBroad: true,
      isSearching: false,
      errorMessage: '',
      resources: [] as Resource[],
    };
  },
  async fetch() {
    // We load the resource types only if we don't have them already
    if (!this.ResourceType.exists()) {
      await this.$store.dispatch('loadResourceTypes');
    }
    // We don't need to load the domains because they are loaded in nuxtServerInit (as they are needed in multiple places)
  },
  computed: {
    ResourceType() {
      return this.$store.$db().model(ResourceType);
    },
    domains() {
      return (
        this.$store
          .$db()
          .model(Domain)
          .all()
          // Hack to have a proper alphabetical sorting of domain names
          .sort((a, b) => (a as Domain).name.localeCompare((b as Domain).name, this.$i18n.locale))
      );
    },
    types(): Collection<ResourceType> {
      return this.ResourceType.all();
    },
    domainIdFilter(): number | undefined {
      if (!(typeof this.selectedDomain === 'number')) {
        return undefined;
      }
      return this.selectedDomain;
    },
    typeIdFilter(): number | undefined {
      if (!(typeof this.selectedType === 'number')) {
        return undefined;
      }
      return this.selectedType;
    },
  },
  created() {
    this.setParametersFromQueryStrings();

    // Directly submitting a search requests if the params are good
    this.checkIfSearchIsTooBroad();
    if (!this.isSearchTooBroad) {
      this.submitSearch();
    }
  },
  methods: {
    checkIfSearchIsTooBroad() {
      this.isSearchTooBroad = this.searchTerm.length < 3 && !this.domainIdFilter && !this.typeIdFilter;
    },
    async submitSearch() {
      if (this.isSearching) {
        // Prevent submit if request is still ongoing
        return;
      }

      this.errorMessage = '';

      this.checkIfSearchIsTooBroad();
      if (this.isSearchTooBroad) {
        return;
      }

      this.isSearching = true;
      this.resources = [];

      this.setQueryStrings();

      // Retrieving search results
      try {
        this.resources = await this.$cmsService.searchResources(
          this.searchTerm,
          this.domainIdFilter,
          this.typeIdFilter
        );
      } catch (error) {
        this.errorMessage = this.$t('resources.search.error').toString() + error;
      } finally {
        this.isSearching = false;
      }
    },
    setQueryStrings() {
      this.$router.push({
        query: {
          q: this.searchTerm ? this.searchTerm : undefined,
          d: this.domainIdFilter ? this.domainIdFilter.toString() : undefined,
          t: this.typeIdFilter ? this.typeIdFilter.toString() : undefined,
        },
      });
    },
    setParametersFromQueryStrings() {
      if (this.$route.query.q && typeof this.$route.query.q === 'string') {
        this.searchTerm = this.$route.query.q;
      }
      if (this.$route.query.d && typeof this.$route.query.d === 'string') {
        this.selectedDomain = parseInt(this.$route.query.d);
      }
      if (this.$route.query.t && typeof this.$route.query.t === 'string') {
        this.selectedType = parseInt(this.$route.query.t);
      }
    },
    resetSearchParameters() {
      this.searchTerm = '';
      this.selectedDomain = ALL_OPTION;
      this.selectedType = ALL_OPTION;
      this.setQueryStrings();
    },
  },
});
</script>

<style scoped>
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

    /* align-items: flex-end; */
  }

  .c-resources__filter {
    width: auto;
  }
}
</style>
