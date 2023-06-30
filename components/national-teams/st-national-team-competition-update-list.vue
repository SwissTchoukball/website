<template>
  <div>
    <h3 v-if="updates && updates.length > 0" class="t-headline-2">
      <st-live-indicator v-show="liveRefresh" class="c-national-team-competition-update-list__live-indicator" />
      {{ $t('internationalCompetition.live.updates.title') }}
    </h3>
    <st-loader v-if="$fetchState.pending" :main="true" />
    <p v-else-if="$fetchState.error">
      {{ $t('internationalCompetition.live.updates.loadingError') }} : {{ $fetchState.error.message }}
    </p>
    <template v-else>
      <p v-if="hasRefreshError">{{ $t('internationalCompetition.live.updates.loadingError') }}</p>
      <ul class="u-unstyled-list">
        <li v-for="update in updates" :key="update.id" class="c-national-team-competition-update-list__item">
          <st-national-team-competition-update :update="update" />
        </li>
      </ul>
      <st-pagination
        v-if="totalPages"
        class="c-national-team-competition-update-list__pagination"
        :current-page="currentPage"
        :total-pages="totalPages"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { NationalTeamCompetitionUpdate } from './st-national-teams.prop';
import StNationalTeamCompetitionUpdate from '~/components/national-teams/st-national-team-competition-update.vue';

const UPDATES_PER_PAGE = 5;
const REFRESH_INTERVAL = 30; // In seconds

export default Vue.extend({
  components: {
    StNationalTeamCompetitionUpdate,
  },
  props: {
    competitionId: {
      type: Number,
      required: true,
    },
    liveRefresh: Boolean,
  },
  data() {
    return {
      updates: undefined as NationalTeamCompetitionUpdate[] | undefined,
      totalUpdates: undefined as number | undefined,
      refreshInterval: undefined as number | undefined,
      hasRefreshError: false,
    };
  },
  async fetch() {
    await this.fetchUpdates();
  },
  computed: {
    totalPages(): number | undefined {
      if (!this.totalUpdates) {
        return;
      }
      return Math.ceil(this.totalUpdates / UPDATES_PER_PAGE);
    },
    currentPage(): number {
      if (this.$route.query.page && typeof this.$route.query.page === 'string') {
        return parseInt(this.$route.query.page);
      }

      return 1;
    },
  },
  watch: {
    '$route.query': '$fetch',
  },
  mounted() {
    this.refreshInterval = window.setInterval(async () => {
      if (!this.liveRefresh) {
        return;
      }
      try {
        await this.fetchUpdates();
        this.hasRefreshError = false;
      } catch (error) {
        console.error(error);
        this.hasRefreshError = true;
      }
    }, REFRESH_INTERVAL * 1000);
  },
  destroyed() {
    window.clearInterval(this.refreshInterval);
  },
  methods: {
    async fetchUpdates() {
      if (!this.competitionId) {
        throw new Error('Undefined national team competition ID');
      }

      const updateResults = await this.$cmsService.getNationalTeamCompetitionUpdates(this.competitionId, {
        limit: UPDATES_PER_PAGE,
        page: this.currentPage,
      });

      this.updates = updateResults.data;
      this.totalUpdates = updateResults.meta.total;
    },
  },
});
</script>

<style scoped>
.c-national-team-competition-update-list__live-indicator {
  transform: translateY(0.3rem);
}

.c-national-team-competition-update-list__item {
  margin-top: var(--st-length-spacing-s);
  padding-bottom: var(--st-length-spacing-xs);
  border-bottom: 1px solid var(--st-color-hr);
}

.c-national-team-competition-update-list__item:first-child {
  margin-top: var(--st-length-spacing-xs);
}

.c-national-team-competition-update-list__item:last-child {
  border: none;
}

.c-national-team-competition-update-list__pagination {
  margin-top: var(--st-length-spacing-s);
}
</style>
