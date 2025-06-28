<template>
  <div v-if="match">
    <nuxt-link class="c-match__phase-round" :to="phaseRoundLink">
      <span v-if="isPhaseNameVisible && phase">
        {{ phase.name }}
      </span>
      <span v-if="isRoundNameVisible && round">
        {{ round.name }}
      </span>
    </nuxt-link>
    <h2 class="c-match__name">
      <span class="c-match__team c-match__team--home" :class="{ 'c-match__team--winner': match.hasHomeTeamWon }">
        {{ match.homeTeamName }}
      </span>
      <span class="c-match__cross">&#9587;</span>
      <span class="c-match__team c-match__team--away" :class="{ 'c-match__team--winner': match.hasAwayTeamWon }">
        {{ match.awayTeamName }}
      </span>
    </h2>
    <div class="c-match__avatars-and-score">
      <img
        v-if="match.home_team && match.home_team.avatarLargeUrl"
        :src="match.home_team.avatarLargeUrl"
        class="c-match__team-avatar"
      />
      <div v-else class="c-match__team-avatar"></div>

      <div v-if="match.hasScore" class="c-match__score">{{ match.home_team_score }} - {{ match.away_team_score }}</div>
      <div v-else class="c-match__no-score"></div>

      <img
        v-if="match.away_team && match.away_team.avatarLargeUrl"
        :src="match.away_team.avatarLargeUrl"
        class="c-match__team-avatar"
      />
      <div v-else class="c-match__team-avatar"></div>
    </div>
    <div class="c-match__additional-info">
      <st-chip v-if="match.isOngoing">
        {{ $t('match.ongoing') }}
      </st-chip>
      <st-chip v-else-if="match.toBeConfirmed">
        {{ $t('match.toBeConfirmed') }}
      </st-chip>
    </div>
    <ul v-if="match.periods" class="c-match__detailed-score u-unstyled-list">
      <template v-for="period in match.periods">
        <li v-if="period.home_team_score || period.away_team_score" :key="period.order" class="c-match__period">
          <st-tooltip position="bottom">
            <template #trigger>{{ period.home_team_score || 0 }} - {{ period.away_team_score || 0 }}</template>
            <template #content>{{ period.name }}</template>
          </st-tooltip>
        </li>
      </template>
    </ul>
    <div v-if="match.referees && match.referees.length" class="c-match__referees">
      <st-custom-icon :view-box-width="512" :view-box-height="512" class="c-match__icon">
        <st-icon-whistle />
      </st-custom-icon>
      <ul class="u-unstyled-list c-match__referee-list">
        <li v-for="referee in match.referees" :key="`${referee.first_name} ${referee.last_name}`">
          {{ referee.first_name }} {{ referee.last_name }}
        </li>
      </ul>
    </div>
    <div id="match-details" class="c-match__details">
      <st-event-date v-if="match.parsedDate" :start-date="match.parsedDate" always-one-line />
      <div v-if="match.parsedDate">
        <font-awesome-icon icon="clock" class="c-match__icon" /> {{ $formatDate(match.parsedDate, 'HH:mm') }}
      </div>
      <button v-if="match.facility" class="u-unstyled-button c-match__venue" @click="showVenueDetails">
        <font-awesome-icon icon="location-dot" class="c-match__icon" /> {{ match.facility.name }},
        {{ match.facility.city }} (<span class="c-match__venue-map-action">{{ $t('venue.map') }}</span
        >)
      </button>
      <div v-else class="c-match__venue c-match__venue--undefined">
        <font-awesome-icon icon="location-dot" class="c-match__icon" /> {{ $t('venue.undefined') }}
      </div>
    </div>
    <div v-if="venueDetailsVisible" id="venue-details" class="c-match__venue-details">
      <div class="c-match__address">
        <font-awesome-icon icon="location-dot" class="c-match__icon" />
        <div v-if="match.facility">
          <strong>{{ match.facility.name }}</strong> <br />
          {{ match.facility.address }}<br />
          {{ match.facility.postal_code }} {{ match.facility.city }}<br />

          <i18n-t v-if="match.addressForMapsUrl" keypath="venue.seeIn" tag="div">
            <template #app>
              <a :href="getOpenStreetMapUrl(match.addressForMapsUrl)">OpenStreetMap</a> /
              <a :href="getAppleMapsUrl(match.addressForMapsUrl)">{{ $t('venue.appleMaps') }}</a> /
              <a :href="getGoogleMapsUrl(match.addressForMapsUrl)">Google Maps</a>
            </template>
          </i18n-t>
        </div>
      </div>
      <client-only>
        <iframe
          v-if="match.hasFacility"
          :src="match.getSwisstopoMapUrl($i18n.locale) || ''"
          frameborder="0"
          class="c-match__map"
        ></iframe>
      </client-only>
    </div>

    <template v-if="data?.matchAdditionalData?.youtube_video_id">
      <h3 class="t-headline-2 c-match__video-title">{{ $t('match.videoTitle') }}</h3>
      <div class="c-match__video-wrapper">
        <iframe
          class="c-match__video"
          :src="`https://www.youtube-nocookie.com/embed/${data.matchAdditionalData.youtube_video_id}`"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </template>

    <template v-if="data?.photos.length">
      <h3 class="t-headline-2 c-match__photos-title">{{ $t('match.photosTitle') }}</h3>
      <st-flickr-album-gallery :photos="data.photos" class="c-match__photos-gallery" />
    </template>
  </div>
</template>

<script setup lang="ts">
import Match from '~/models/match.model';
import {
  type Leverade,
  type LeveradeFacility,
  LeveradeGroupType,
  type LeveradePeriod,
  type LeveradeProfile,
  type LeveradeResult,
} from '~/plugins/07.leverade';
import type { FlickrPhoto } from '~/plugins/05.flickr';
import type Season from '~/models/season.model';
import type { Await } from '~/types/types.utils';
import type { DirectusMatchAdditionalData } from '~/plugins/06.directus';
import Team from '~/models/team.model';
import Faceoff from '~/models/faceoff.model';
import Round from '~/models/round.model';
import CompetitionEdition from '~/models/competition-edition.model';
import Phase from '~/models/phase.model';
import type { NationalCompetitionEdition } from '~/plugins/08.cms-service';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const { t } = useI18n();
const { $cmsService, $leverade, $flickr, $formatDate } = useNuxtApp();
const { getOpenStreetMapUrl, getAppleMapsUrl, getGoogleMapsUrl } = useMapUrls();

definePageMeta({
  scrollToTop: true,
});

const props = defineProps({
  season: {
    type: Object as PropType<Season>,
    required: true,
  },
});

const venueDetailsVisible = ref(false);

const { data } = useAsyncData<{
  leveradeMatchData: Await<ReturnType<Leverade['getMatch']>>;
  directusCompetitionEdition: NationalCompetitionEdition | undefined;
  matchAdditionalData: DirectusMatchAdditionalData | null;
  photos: FlickrPhoto[];
}>(route.params.matchId as string, async () => {
  const leveradeMatchData = await $leverade.getMatch(route.params.matchId as string);
  const matchAdditionalData = await $cmsService.getMatchAdditionalData(+route.params.matchId);

  if (!leveradeMatchData.included) {
    throw new Error('Missing related match data');
  }

  // Loading Directus-only data
  const tournament = leveradeMatchData.included.find((data) => data.type === 'tournament');
  let directusCompetitionEdition: NationalCompetitionEdition | undefined;
  if (tournament) {
    const competitionEditions = await $cmsService.getNationalCompetitionEditions({
      leveradeIds: [tournament.id],
    });
    // There should be only one edition matching the request parameters.
    if (competitionEditions.length > 1) {
      console.warn('Multiple competition editions matching the request. Taking the first one.');
    }
    directusCompetitionEdition = competitionEditions[0];
  }

  let photos: FlickrPhoto[] = [];
  if (matchAdditionalData?.flickr_photoset_id) {
    // Doc: https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    const flickrResponse = await $flickr('flickr.photosets.getPhotos', {
      user_id: runtimeConfig.public.flickr.userId,
      photoset_id: matchAdditionalData.flickr_photoset_id,
      extras: 'url_q,url_m',
    });
    photos = flickrResponse.photoset.photo;
  }

  return {
    leveradeMatchData,
    directusCompetitionEdition,
    matchAdditionalData,
    photos,
  };
});

const distributedMatchData = computed<
  | {
      match: Match;
      round: Round | undefined;
      phase: Phase | undefined;
      edition: CompetitionEdition | undefined;
    }
  | undefined
>(() => {
  if (!data.value?.leveradeMatchData.included) {
    return;
  }

  const match = new Match(data.value.leveradeMatchData.data);
  const teams: Team[] = [];
  let faceoff: Faceoff | undefined;
  let round: Round | undefined;
  let phase: Phase | undefined;
  let edition: CompetitionEdition | undefined;
  let facility: LeveradeFacility | undefined;
  const results: LeveradeResult[] = [];
  const periods: LeveradePeriod[] = [];
  const referees: LeveradeProfile[] = [];

  if (data.value.directusCompetitionEdition) {
    edition = new CompetitionEdition(data.value.directusCompetitionEdition);
  }

  data.value.leveradeMatchData.included.forEach((entity) => {
    switch (entity.type) {
      case 'team':
        teams.push(new Team(entity));
        break;
      case 'faceoff':
        faceoff = new Faceoff(entity);
        break;
      case 'round':
        round = new Round(entity);
        break;
      case 'group':
        phase = new Phase(entity);
        break;
      case 'tournament':
        edition?.addLeveradeData({ tournament: entity });
        break;
      case 'facility':
        facility = entity;
        break;
      case 'result':
        results.push(entity);
        break;
      case 'period':
        periods.push(entity);
        break;
      case 'profile':
        // For now it's fine to do this because the only profiles we get for a match are referees.
        // If later one we retrieve the players, then we'll have to add more logic to differentiate them.
        referees.push(entity);
        break;
      default:
    }
  });
  match.flickr_photoset_id = data.value.matchAdditionalData?.flickr_photoset_id;
  match.faceoff = faceoff;
  match.setTeams(teams);
  match.setResults(results);
  match.setPeriods(periods, results);
  match.setReferees(referees);
  if (facility) {
    match.setFacility([facility]);
  }

  return {
    match,
    round,
    phase,
    edition,
  };
});
const match = computed<Match | undefined>(() => {
  return distributedMatchData.value?.match;
});

const phase = computed<Phase | undefined>(() => {
  return distributedMatchData.value?.phase;
});

const round = computed<Round | undefined>(() => {
  return distributedMatchData.value?.round;
});

const competitionEdition = computed<CompetitionEdition | undefined>(() => {
  return distributedMatchData.value?.edition;
});

const isPhaseNameVisible = computed<boolean>(() => {
  return !!phase.value && phase.value.type !== LeveradeGroupType.PLAY_OFF;
});

const isRoundNameVisible = computed<boolean>(() => {
  return (
    !!phase.value?.name && !!round.value?.name && (!isPhaseNameVisible.value || round.value.name !== phase.value.name)
  );
});

/**
 * Links to the planning if the match we're viewing has not been played yet,
 * and if it has, it rather links to the results.
 */
const phaseRoundLink = computed<string>(() => {
  let pathName = 'competitions-competition-season-phase-planning';
  if (match.value?.finished) {
    pathName = 'competitions-competition-season-phase-results';
  }
  if (!phase.value) {
    return '';
  }
  return localePath({ name: pathName, params: { phase: phase.value.id } });
});

const showVenueDetails = (): void => {
  venueDetailsVisible.value = true;
  router.push('#match-details');
};

useHead(() => {
  let title = '';
  if (match.value?.home_team && match.value?.away_team) {
    title += `${match.value.home_team.name} - ${match.value.away_team.name} · `;
  }
  if (phase.value && round.value) {
    title += `${round.value.name} · ${phase.value.name} · `;
    if (competitionEdition.value && phase.value.name !== competitionEdition.value.name) {
      title += `${competitionEdition.value.name} · `;
    }
    title += props.season.name;
  }

  return {
    title,
    meta: [
      { property: 'og:title', content: title },
      {
        hid: 'og:description',
        property: 'og:description',
        content: t('competitions.description.match').toString(),
      },
    ],
  };
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.c-match__phase-round {
  display: block;
  text-align: center;
  color: var(--st-color-match-phase-round);
  font-weight: 900;
  text-transform: uppercase;
  text-decoration: none;
  margin-top: var(--st-length-spacing-s);
}

.c-match__phase-round > *:not(:last-child)::after {
  content: '-';
}

.c-match__name {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: 900;
  margin-top: var(--st-length-spacing-xs);
}

.c-match__team {
  flex: 1 1 0;
}

.c-match__team--home {
  text-align: right;
}

.c-match__team--winner {
  text-decoration: underline;
}

.c-match__cross {
  margin: 0 var(--st-length-spacing-s);
}

.c-match__avatars-and-score {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--st-length-spacing-s);
}

.c-match__team-avatar {
  width: 30vw;
  height: 30vw;
  max-width: 250px;
  max-height: 250px;
}

.c-match__score {
  margin: var(--st-length-spacing-xs);
  color: var(--st-color-match-score);
  font-weight: 900;
  font-size: 1.5em;
  white-space: nowrap;
}

.c-match__no-score {
  width: 10vw;
}

.c-match__additional-info {
  margin-top: var(--st-length-spacing-s);
  text-align: center;
}

.c-match__detailed-score {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-weight: bold;
  margin-top: var(--st-length-spacing-xxs);
}

.c-match__period {
  white-space: nowrap;
}

.c-match__period:not(:last-child)::after {
  content: '/';
  padding-left: 0.9rem;
}

.c-match__referees {
  margin-top: var(--st-length-spacing-s);
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.c-match__referee-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.c-match__details {
  margin-top: var(--st-length-spacing-m);
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
}

.c-match__details > * {
  margin-bottom: var(--st-length-spacing-xxs);
}

.c-match__icon {
  color: var(--st-color-event-icon);
}

.c-match__details .c-match__icon {
  margin-left: var(--st-length-spacing-xs);
}

.c-match__venue {
  font-size: inherit;
  cursor: pointer;
}

.c-match__venue--undefined {
  cursor: default;
}

.c-match__venue-map-action {
  color: var(--st-color-link);
  text-decoration: underline;
}

.c-match__venue-details {
  position: relative;
  margin-top: var(--st-length-spacing-s);
}

.c-match__address {
  display: flex;
}

.c-match__address .c-match__icon {
  margin-right: var(--st-length-spacing-xxs);
}

.c-match__map {
  margin-top: var(--st-length-spacing-xs);
  width: 100%;
  height: 50vh;
  border: 0;
}

.c-match__video-title {
  padding-top: var(--st-length-spacing-m);
}

.c-match__video-wrapper {
  margin-top: var(--st-length-spacing-s);
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.c-match__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-match__photos-title {
  padding-top: var(--st-length-spacing-m);
}

.c-match__photos-gallery {
  margin-top: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .c-match__name {
    font-size: 2em;
  }

  .c-match__score {
    margin: var(--st-length-spacing-s);
    font-size: 2.5em;
  }

  .c-match__detailed-score {
    font-size: 1.5em;
  }

  .c-match__referee-list {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
}

@media (--md-and-up) {
  .c-match__score {
    margin: var(--st-length-spacing-m);
    font-size: 3em;
  }

  .c-match__detailed-score {
    font-size: 1.8em;
  }
}

@media (--lg-and-up) {
  .c-match__score {
    margin: var(--st-length-spacing-l);
  }
}
</style>
