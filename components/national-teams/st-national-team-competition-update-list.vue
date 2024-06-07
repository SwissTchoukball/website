<template>
  <div v-if="fetchPending || fetchError || (data.updates && (data.updates.length || !isPast))">
    <div class="c-national-team-competition-update-list__header">
      <st-tooltip>
        <template #trigger>
          <st-live-indicator v-if="liveRefresh" />
        </template>
        <template #content>{{ $t('internationalCompetition.live.updates.autoRefresh') }}</template>
      </st-tooltip>
      <h3 class="t-headline-2 c-national-team-competition-update-list__title">
        {{ $t('internationalCompetition.live.updates.title') }}
      </h3>
      <button
        class="u-unstyled-button c-national-team-competition-update-list__settings"
        :class="{ 'c-national-team-competition-update-list__settings--open': areFiltersVisible }"
        @click="toggleFilters"
      >
        <font-awesome-icon icon="sliders" />
      </button>
      <div
        v-if="amountActiveFilters && !areFiltersVisible"
        class="c-national-team-competition-update-list__active-filters-amount"
        @click="areFiltersVisible = true"
      >
        {{ amountActiveFilters }}
      </div>
      <div class="c-national-team-competition-update-list__header-spacer"></div>
      <st-button v-if="telegramChannelName" :to="`https://t.me/${telegramChannelName}`" :primary="true" :narrow="true">
        {{ $t('internationalCompetition.live.updates.subscribe') }}
      </st-button>
    </div>
    <st-loader v-if="fetchPending" :main="true" />
    <p v-else-if="fetchError">
      {{ $t('internationalCompetition.live.updates.loadingError') }} : {{ fetchError.message }}
    </p>
    <template v-else>
      <ul v-if="areFiltersVisible" class="c-national-team-competition-update-list__filters u-unstyled-list">
        <li>
          <input id="key-update-toggle" v-model="filters.is_key" type="checkbox" />
          <label for="key-update-toggle">{{ $t('internationalCompetition.live.updates.filters.keyEvents') }}</label>
        </li>
        <li>
          <input id="with-image-toggle" v-model="filters.with_image" type="checkbox" />
          <label for="with-image-toggle">{{ $t('internationalCompetition.live.updates.filters.withImage') }}</label>
        </li>
        <li>
          <select
            v-model="filters.selectedTeamId"
            class="c-national-team-competition-update-list__team-filter"
            :aria-label="$t('internationalCompetition.live.updates.filters.teams').toString()"
          >
            <option :value="undefined">{{ $t('internationalCompetition.live.updates.filters.noTeamFilter') }}</option>
            <option v-for="team of teams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </li>
      </ul>

      <p v-if="hasRefreshError">{{ $t('internationalCompetition.live.updates.loadingError') }}</p>
      <ul v-if="data.updates && data.updates.length > 0" class="u-unstyled-list">
        <li
          v-for="update in data.updates"
          :key="update.id"
          class="c-national-team-competition-update-list__item"
          :class="{ 'c-national-team-competition-update-list__item--with-image': update.image }"
        >
          <st-national-team-competition-update :update="update" />
        </li>
      </ul>
      <p v-else class="c-national-team-competition-update-list__blank-slate">
        <template v-if="amountActiveFilters">
          {{ $t('internationalCompetition.live.updates.noUpdatesMatchingFilters') }}
        </template>
        <template v-else>
          {{ $t('internationalCompetition.live.updates.noUpdatesYet') }}
        </template>
      </p>
      <st-pagination
        v-if="totalPages"
        class="c-national-team-competition-update-list__pagination"
        :current-page="currentPage"
        :total-pages="totalPages"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { NationalTeamCompetitionUpdate } from './st-national-teams.prop';

const route = useRoute();
const { $cmsService } = useNuxtApp();

const UPDATES_PER_PAGE = 10;
const REFRESH_INTERVAL = 30; // In seconds

const props = defineProps({
  competitionId: {
    type: Number,
    required: true,
  },
  teams: {
    type: Array as PropType<{ id: number; name: string }[]>,
    default: () => [],
  },
  telegramChannelName: {
    type: String,
    default: undefined,
  },
  liveRefresh: Boolean,
  isPast: Boolean,
});

const areFiltersVisible = ref(false);
const filters = ref({
  is_key: false,
  with_image: false,
  selectedTeamId: undefined as string | undefined,
});
const refreshInterval = ref<number>();
const hasRefreshError = ref(false);

const currentPage = computed<number>(() => {
  if (route.query.page && typeof route.query.page === 'string') {
    return parseInt(route.query.page);
  }

  return 1;
});

const {
  data,
  pending: fetchPending,
  error: fetchError,
  refresh,
} = useAsyncData<{ updates: NationalTeamCompetitionUpdate[]; totalUpdates: number }>(
  'updates',
  async () => {
    if (!props.competitionId) {
      throw new Error('Undefined national team competition ID');
    }

    const updateResults = await $cmsService.getNationalTeamCompetitionUpdates(props.competitionId, {
      limit: UPDATES_PER_PAGE,
      page: currentPage.value,
      keyOnly: filters.value.is_key,
      withImage: filters.value.with_image,
      teamId: filters.value.selectedTeamId ? +filters.value.selectedTeamId : undefined,
    });

    return {
      updates: updateResults.data,
      totalUpdates: updateResults.meta.total,
    };
  },
  { default: () => ({ updates: [], totalUpdates: 0 }) },
);

const totalPages = computed<number | undefined>(() => {
  if (!data.value?.totalUpdates) {
    return;
  }
  return Math.ceil(data.value.totalUpdates / UPDATES_PER_PAGE);
});

const amountActiveFilters = computed<number>(() => {
  let amount = 0;

  if (filters.value.is_key) {
    amount++;
  }

  if (filters.value.with_image) {
    amount++;
  }

  if (filters.value.selectedTeamId) {
    amount++;
  }

  return amount;
});

watch(route, async (newRoute, oldRoute) => {
  if (newRoute.query !== oldRoute.query) {
    await refresh();
  }
});

watch(
  filters,
  async () => {
    await refresh();
  },
  { deep: true },
);

onMounted(() => {
  refreshInterval.value = window.setInterval(async () => {
    if (!props.liveRefresh) {
      return;
    }
    try {
      await refresh();
      hasRefreshError.value = false;
    } catch (error) {
      console.error(error);
      hasRefreshError.value = true;
    }
  }, REFRESH_INTERVAL * 1000);
});

onBeforeUnmount(() => {
  window.clearInterval(refreshInterval.value);
});

const toggleFilters = () => {
  areFiltersVisible.value = !areFiltersVisible.value;
};
</script>

<style scoped>
.c-national-team-competition-update-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--st-length-spacing-xxs);
}

.c-national-team-competition-update-list__title {
  padding-top: 0;
}

.c-national-team-competition-update-list__settings {
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--st-color-link);
  background-color: white;
  border-radius: 50%;
  flex-shrink: 0;
}

.c-national-team-competition-update-list__settings--open {
  color: white;
  background-color: var(--st-color-link);
}

.c-national-team-competition-update-list__active-filters-amount {
  font-size: 0.8em;
  font-weight: bold;
  color: white;
  background-color: var(--st-color-link);
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(-0.25rem);
  cursor: pointer;
  flex-shrink: 0;
}

.c-national-team-competition-update-list__header-spacer {
  flex-grow: 2;
}

.c-national-team-competition-update-list__subscribe-link {
  display: inline-block;
  margin-left: var(--st-length-spacing-xs);
  font-weight: normal;
  font-size: 0.8em;
}

.c-national-team-competition-update-list__filters {
  margin-top: var(--st-length-spacing-xxs);
  display: flex;
  flex-wrap: wrap;
  gap: var(--st-length-spacing-xxs) var(--st-length-spacing-xs);
  font-size: 0.8em;
  align-items: center;
}

.c-national-team-competition-update-list__team-filter {
  font-size: inherit;
  font-family: inherit;
}

.c-national-team-competition-update-list__item {
  margin-top: var(--st-length-spacing-s);
  padding-bottom: var(--st-length-spacing-s);
  border-bottom: 1px solid var(--st-color-hr);
}

.c-national-team-competition-update-list__item:first-child {
  margin-top: var(--st-length-spacing-xs);
}

.c-national-team-competition-update-list__item:last-child {
  border: none;
}

.c-national-team-competition-update-list__item--with-image {
  padding-bottom: 0;
  border: none;
}

.c-national-team-competition-update-list__blank-slate {
  margin-top: var(--st-length-spacing-m);
  text-align: center;
  font-weight: bold;
}

.c-national-team-competition-update-list__pagination {
  margin-top: var(--st-length-spacing-s);
}
</style>
