<template>
  <div>
    <template v-if="phase.futureMatches.length > 0">
      <ul v-for="match of phase.futureMatches" :key="match.id" class="u-unstyled-list">
        <li v-if="showMatch(match)">
          <nuxt-link
            class="c-planning__match"
            :to="localePath({ name: 'competitions-competition-season-match-matchId', params: { matchId: match.id } })"
          >
            <st-event-date v-if="match.parsedDate" :start-date="match.parsedDate" always-one-line />
            <div v-if="showMatchRound" class="c-planning__match-round">
              {{ getRoundName(match) }}
            </div>
            <h4 v-if="match.homeTeamName || match.awayTeamName" class="c-planning__match-name">
              <div class="c-planning__match-team c-planning__match-team--home">
                <img
                  v-if="match.home_team && match.home_team.avatarMediumUrl"
                  :src="match.home_team.avatarMediumUrl"
                  class="c-planning__match-team-avatar"
                />
                {{ match.homeTeamName }}
              </div>

              <div class="c-planning__match-cross">&#9587;</div>

              <div class="c-planning__match-team c-planning__match-team--away">
                <img
                  v-if="match.away_team && match.away_team.avatarMediumUrl"
                  :src="match.away_team.avatarMediumUrl"
                  class="c-planning__match-team-avatar"
                />
                {{ match.awayTeamName }}
              </div>
            </h4>
            <div class="c-planning__match-details">
              <st-cancelled-label v-if="match.canceled" class="c-planning__match-cancelled" />
              <template v-else>
                <template v-if="showTime(match)">
                  <font-awesome-icon icon="clock" class="c-planning__match-icon" />
                  {{ match.parsedDate ? $formatDate(match.parsedDate, 'HH:mm') : '' }}
                </template>
                <template v-if="match.facility">
                  <font-awesome-icon icon="location-dot" class="c-planning__match-icon" />
                  {{ match.facility.name }}, {{ match.facility.city }}
                </template>
              </template>
            </div>
            <div v-if="match.youtube_video_id" class="c-planning__match-additional-info">
              <st-chip>{{ $t('match.live') }}</st-chip>
            </div>
          </nuxt-link>
        </li>
      </ul>
    </template>
    <p v-else class="l-blank-slate-message">{{ $t('competitions.planning.noMatches') }}</p>
  </div>
</template>

<script setup lang="ts">
import type Season from '~/models/season.model';
import type Phase from '~/models/phase.model';
import type Match from '~/models/match.model';
import type CompetitionEdition from '~/models/competition-edition.model';
import { LeveradeGroupType } from '~/plugins/07.leverade';
import type Round from '~/models/round.model';

const localePath = useLocalePath();
const { t } = useI18n();
const { $formatDate } = useNuxtApp();

definePageMeta({
  scrollToTop: true,
});

defineI18nRoute({
  paths: {
    fr: '/competitions/[competition]/[season]/[phase]/programme',
    de: '/wettbewerbe/[competition]/[season]/[phase]/programm',
  },
});

const props = defineProps({
  season: {
    type: Object as PropType<Season>,
    required: true,
  },
  competitionEdition: {
    type: Object as PropType<CompetitionEdition>,
    required: true,
  },
  phase: {
    type: Object as PropType<Phase>,
    required: true,
  },
});

useHead(() => {
  const title = t('competitions.headTitle.planning', {
    phaseName: props.phase.name,
    editionName: props.competitionEdition.name,
    seasonName: props.season.name,
  }).toString();
  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.planning').toString(),
      },
    ],
  };
});

const showMatchRound = computed<boolean>(() => {
  return props.phase.type === LeveradeGroupType.PLAY_OFF;
});

const showMatch = (match: Match): boolean => {
  return !!(showMatchRound.value || match.home_team || match.away_team || !match.canceled);
};

const showTime = (match: Match): boolean => {
  // This can be a problem if a match is actually scheduled at midnight.
  // Unfortunately, there's currently no way to differentiate a match for which the date is not set from one where it is scheduled at midnight.
  return !!(match.parsedDate && $formatDate(match.parsedDate, 'HH:mm') !== '00:00');
};

const getRound = (roundId: string): Round | undefined => {
  return props.phase?.rounds?.find((round) => round.id === roundId);
};

const getRoundName = (match: Match): string => {
  const round = getRound(match.round_id);
  return round?.name || '';
};
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-planning__match {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--st-length-spacing-xs);
  position: relative;
  margin-top: var(--st-length-spacing-s);
  width: 100%;
  color: inherit;
  text-decoration: none;
}

.c-planning__match-main {
  flex-grow: 2;
}

.c-planning__match-round {
  color: var(--st-color-planning-match-round);
  font-size: 0.9em;
  font-weight: bold;
  margin-top: var(--st-length-spacing-xxs);
}

.c-planning__match-name {
  display: flex;
  align-items: center;
  font-weight: 900;
  font-size: 1.2em;
  width: 100%;
}

.c-planning__match-team {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  align-self: flex-start;
}

.c-planning__match-team--home {
  align-items: flex-end;
  text-align: right;
}

.c-planning__match-team--away {
  align-items: flex-start;
  text-align: left;
}

.c-planning__match-cross {
  padding: var(--st-length-spacing-xs);
}

.c-planning__match-team-avatar {
  width: 50px;
  height: 50px;
}

.c-planning__match-team--home .c-planning__match-team-avatar {
  margin-left: var(--st-length-spacing-xs);
}

.c-planning__match-team--away .c-planning__match-team-avatar {
  margin-right: var(--st-length-spacing-xs);
}

.c-planning__match-details {
  margin-top: var(--st-length-spacing-xxs);
}

.c-planning__match-icon {
  color: var(--st-color-event-icon);
}

.c-planning__match-icon:not(:first-child) {
  margin-left: var(--st-length-spacing-xs);
}

.c-planning__match-additional-info {
  margin-top: var(--st-length-spacing-xxs);
  display: flex;
  gap: var(--st-length-spacing-xxs);
}

@media (--sm-and-up) {
  .c-planning__match-team {
    flex-direction: row;
    align-items: center;
    align-self: center;
  }

  .c-planning__match-team--home {
    flex-direction: row-reverse;
  }
}
</style>
