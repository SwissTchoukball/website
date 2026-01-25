<template>
  <div>
    <section class="l-main-content-section">
      <st-news-hero v-if="newsEntries && newsEntries[0]" :news-entry="newsEntries[0]" class="c-index__news-hero" />
      <div class="c-index__news-list-container">
        <st-news-list
          v-if="newsEntries"
          :news="newsEntries.slice(1, 5)"
          single-row
          hide-dates
          class="c-index__news-list"
        />
      </div>
      <st-link-action :to="localePath('news')" class="c-index__read-more-news" with-arrow>
        {{ $t('news.readMore') }}
      </st-link-action>
    </section>

    <section v-if="events?.length" class="l-main-content-section c-index__events">
      <h2 class="t-headline-1">
        <nuxt-link :to="localePath('calendar')" class="c-index__section-title">{{ $t('events.title') }}</nuxt-link>
      </h2>
      <ul class="u-unstyled-list c-index__event-list">
        <li v-for="event of events" :key="`event-${event.id}`" class="c-index__event-item">
          <st-event-small
            :start-date="event.date_start"
            :end-date="event.date_end"
            :is-full-day="event.isFullDay"
            :name="event.name"
            :details="event.venue ? event.venue.name + (event.venue.city ? `, ${event.venue.city}` : '') : ''"
            :to="
              localePath({
                name: 'event-slug',
                params: { slug: `${event.id}-${slugify(event.name)}` },
              })
            "
          />
        </li>
      </ul>
      <st-link-action :to="localePath('calendar')" class="c-index__read-more-news" with-arrow>
        {{ $t('events.goToEvents') }}
      </st-link-action>
    </section>

    <!--
      We render this component client-side only because its rendering does not match server-side rendered content.
      The reason is that we initially show the component, then hide it if the fetch returns no matches.
    -->
    <client-only>
      <st-upcoming-matches />
    </client-only>

    <section class="l-main-content-section c-index__tchoukball">
      <h2 class="t-headline-1">Tchoukball</h2>
      <div class="directus-formatted-content .directus-formatted-content--large" v-html="tchoukballDescription"></div>
      <nav>
        <ul class="c-index__tchoukball-nav u-unstyled-list">
          <li v-for="item of tchoukballNavigation" :key="item.name" class="c-index__tchoukball-nav-item">
            <st-button :to="item.path[locale as 'fr' | 'de']" variant="secondary">{{
              $t(`tchoukball.nav.${item.name}`)
            }}</st-button>
          </li>
        </ul>
      </nav>
    </section>

    <section v-if="latestAlbums" class="l-main-content-section">
      <h2 class="t-headline-1">{{ $t('photos.latestAlbums') }}</h2>
      <div class="c-index__flickr-photos">
        <st-flickr-album-link
          v-for="album of latestAlbums"
          :key="album.id"
          :album="album"
          class="c-index__flickr-photo"
        />
      </div>
      <st-link-action to="https://flickr.com/swisstchoukball" class="c-index__see-more-photos" with-arrow>
        {{ $t('photos.seeMore') }}
      </st-link-action>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '~/plugins/08.cms-service';
import stEventSmall from '~/components/events/st-event-small.vue';
import stUpcomingMatches from '~/components/competitions/st-upcoming-matches.vue';
import type { FlickrPhotoset } from '~/plugins/05.flickr';
import type { NewsEntry } from '~/components/news/st-news';

const runtimeConfig = useRuntimeConfig();
const localePath = useLocalePath();
const { locale, t } = useI18n();
const { slugify } = useSlugify();
const { $cmsService, $flickr } = useNuxtApp();

const amountNews = ref(5);
const amountUpcomingEvents = ref(9);
// TODO: low prio: Move the navigation data to the CMS.
const tchoukballNavigation = ref([
  {
    name: 'presentation',
    path: {
      fr: '/presentation',
      de: '/de/vorstellung',
    },
  },
  {
    name: 'rules',
    path: {
      fr: '/regles',
      de: '/de/regeln',
    },
  },
  {
    name: 'charter',
    path: {
      fr: '/charte',
      de: '/de/charta',
    },
  },
  {
    name: 'history',
    path: {
      fr: '/historique',
      de: '/de/geschichte',
    },
  },
  {
    name: 'material',
    path: {
      fr: '/materiel',
      de: '/de/ausruestung',
    },
  },
]);

const { data: newsEntries } = useAsyncData<NewsEntry[]>(`news-entries-${locale.value}`, async () => {
  const newsResult = await $cmsService.getNews({
    limit: amountNews.value,
    page: 1,
    withImageOnly: true,
    forHomepage: true,
  });

  return newsResult.data;
});

const { data: events } = useAsyncData<CalendarEvent[]>(`events-upcoming-${locale.value}`, async () => {
  const eventsResult = await $cmsService.getEvents({
    limit: amountUpcomingEvents.value,
    page: 1,
    upcoming: true,
    excludeCancelled: true,
  });

  return eventsResult.data;
});

const { data: tchoukballDescription } = useAsyncData<string>(`tchoukballDescription-${locale.value}`, async () => {
  return (await $cmsService.getText(1))?.body;
});

const { data: latestAlbums } = useAsyncData<FlickrPhotoset[]>('flickrAlbums', async () => {
  // Doc: https://www.flickr.com/services/api/flickr.photosets.getList.html
  const flickrResponse = await $flickr('flickr.photosets.getList', {
    user_id: runtimeConfig.public.flickr.userId,
    per_page: '6',
    primary_photo_extras: 'url_q,url_m',
  });
  return flickrResponse.photosets.photoset;
});

useHead(() => {
  return {
    meta: [{ property: 'og:title', content: t('title').toString() }],
  };
});
</script>

<style scoped>
@import url('~/assets/css/media.css');

.l-main-content-section:nth-child(even) {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-index__news-hero {
  margin-top: var(--st-length-spacing-xs);
}

.c-index__news-list-container {
  position: relative;
  width: 100vw;
  margin-top: var(--st-length-spacing-s);
  margin-left: calc(-1 * var(--st-length-main-content-side-padding));
}

.c-index__news-list {
  padding-inline: var(--st-length-main-content-side-padding);
}

.c-index__section-title {
  color: var(--st-color-text);
}

.c-index__see-more-photos,
.c-index__read-more-news {
  display: block;
  text-align: right;
  margin-top: var(--st-length-spacing-xs);
}

.c-index__tchoukball-nav {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.c-index__tchoukball-nav-item {
  margin: var(--st-length-spacing-xs);
}

.c-index__events {
  overflow: hidden;
}

.c-index__event-list {
  display: flex;
  flex-direction: column;
}

.c-index__event-item {
  margin-top: var(--st-length-spacing-xs);
  width: 100%;
}

.c-index__event-item:nth-of-type(1n + 7) {
  display: none;
}

.c-index__flickr-photos {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.c-index__flickr-photo {
  max-width: 100%;
  margin-top: var(--st-length-spacing-s);
}

.c-index__flickr-photo:nth-of-type(1n + 5) {
  display: none;
}

@media (--sm-and-up) {
  .c-index__event-list {
    flex-wrap: wrap;
    max-height: 13em;
  }

  .c-index__event-item {
    width: 49%;
  }

  .c-index__flickr-photo {
    max-width: 47%;
  }

  .c-index__flickr-photo:nth-of-type(1n + 5) {
    display: block;
  }
}

@media (--md-and-up) {
  .c-index__news-list-container::before,
  .c-index__news-list-container::after {
    content: '';
    position: absolute;
    top: 0;
    width: var(--st-length-main-content-side-padding);
    height: 100%;
    z-index: 1;
  }

  .c-index__news-list-container::before {
    left: 0;
    background: linear-gradient(to right, white, white 25%, rgb(255 255 255 / 0%));
  }

  .c-index__news-list-container::after {
    right: 0;
    background: linear-gradient(to right, rgb(255 255 255 / 0%), white 75%, white);
  }

  .c-index__flickr-photo {
    max-width: 30%;
  }
}

@media (--lg-and-up) {
  .c-index__event-item {
    width: 33%;
  }

  .c-index__event-item:nth-of-type(1n + 7) {
    display: block;
  }

  .c-index__flickr-photo {
    max-width: 18%;
  }

  .c-index__flickr-photo:nth-of-type(1n + 6) {
    display: none;
  }
}
</style>
