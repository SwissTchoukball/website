<template>
  <div>
    <section class="l-main-content-section">
      <st-home-carousel v-if="carouselItems" :items="carouselItems" />
      <st-link-action :to="localePath('news')" class="c-index__read-more-news" with-arrow>
        {{ $t('news.readMore') }}
      </st-link-action>
    </section>

    <section v-if="events.length" class="l-main-content-section c-index__events">
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
            :details="event.venue.name"
            :to="
              localePath({
                name: 'calendar',
                query: {
                  month: $formatDate(event.date_start, 'M'),
                  year: $formatDate(event.date_start, 'yyyy'),
                },
                hash: `#event-${event.id}`,
              })
            "
          />
        </li>
      </ul>
      <st-link-action :to="localePath('calendar')" class="c-index__read-more-news" with-arrow>
        {{ $t('events.goToEvents') }}
      </st-link-action>
    </section>

    <st-upcoming-matches />

    <section class="l-main-content-section">
      <h2 class="t-headline-1">Tchoukball</h2>
      <p class="l-paragraph l-paragraph--large" v-html="$t('tchoukball.description')"></p>
      <nav>
        <ul class="c-index__tchoukball-nav u-unstyled-list">
          <li v-for="item of tchoukballNavigation" :key="item.name" class="c-index__tchoukball-nav-item">
            <nuxt-link :to="item.path[$i18n.locale]">{{ $t(`tchoukball.nav.${item.name}`) }}</nuxt-link>
          </li>
        </ul>
      </nav>
    </section>

    <section v-if="latestPhotos" class="l-main-content-section">
      <h2 class="t-headline-1">{{ $t('photos.latest') }}</h2>
      <div class="c-index__flickr-photos">
        <st-flickr-photo v-for="photo of latestPhotos" :key="photo.id" :photo="photo" class="c-index__flickr-photo" />
      </div>
      <st-link-action href="https://flickr.com/swisstchoukball" class="c-index__see-more-photos" with-arrow>
        {{ $t('photos.seeMore') }}
      </st-link-action>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import { CarouselItem } from '~/components/st-home-carousel.vue';
import { CalendarEvent } from '~/plugins/cms-service';
import stEventSmall from '~/components/events/st-event-small.vue';
import stUpcomingMatches from '~/components/competitions/st-upcoming-matches.vue';
import { FlickrPhoto } from '~/plugins/flickr';

export default Vue.extend({
  components: {
    stEventSmall,
    stUpcomingMatches,
  },
  data() {
    return {
      amountNewsInCarousel: 5,
      carouselItems: [] as CarouselItem[],
      amountUpcomingEvents: 9,
      events: [] as CalendarEvent[],
      latestPhotos: [] as FlickrPhoto[],
      // TODO: low prio: Move the navigation data to the CMS.
      tchoukballNavigation: [
        {
          name: 'presentation',
          path: {
            fr: '/fr/presentation',
            de: '/de/vorstellung',
          },
        },
        {
          name: 'rules',
          path: {
            fr: '/fr/regles',
            de: '/de/regeln',
          },
        },
        {
          name: 'charter',
          path: {
            fr: '/fr/charte',
            de: '/de/charta',
          },
        },
        {
          name: 'history',
          path: {
            fr: '/fr/historique',
            de: '/de/geschichte',
          },
        },
        {
          name: 'material',
          path: {
            fr: '/fr/materiel',
            de: '/de/ausruestung',
          },
        },
      ],
    };
  },
  async fetch() {
    // TODO: Create dedicated components for each section and move the fetch hooks to the respective components

    // News for carousel
    const newsResult = await this.$cmsService.getNews({
      limit: this.amountNewsInCarousel,
      page: 1,
      withImageOnly: true,
    });

    // TODO: Consider having other entities than news entries in carousel.
    this.carouselItems = newsResult.data
      .filter((newsEntry) => newsEntry.main_image)
      .map((newsEntry) => {
        return {
          image: {
            directusAssetId: newsEntry.main_image!.id,
            alt: newsEntry.main_image!.description,
          },
          caption: newsEntry.title,
          href: this.localePath(`/news/${newsEntry.id}-${newsEntry.slug}`),
        };
      });

    // Upcoming events
    const eventsResult = await this.$cmsService.getEvents({
      limit: this.amountUpcomingEvents,
      page: 1,
      upcoming: true,
      excludeCancelled: true,
    });

    this.events = eventsResult.data;

    // Latest Flickr photos
    // Doc: https://www.flickr.com/services/api/flickr.people.getPublicPhotos.html
    const flickrResponse = await this.$flickr.people.getPublicPhotos({
      user_id: this.$config.flickr.userId,
      per_page: 6,
      extras: ['url_q', 'url_m'],
    });
    this.latestPhotos = flickrResponse.body.photos.photo;
  },
  head(): MetaInfo {
    return {
      meta: [{ property: 'og:title', content: this.$t('title').toString() }],
    };
  },
});
</script>

<style scoped>
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
  max-width: 30%;
  margin-top: var(--st-length-spacing-s);
}

@media (--sm-and-up) {
  .c-index__event-list {
    flex-wrap: wrap;
    max-height: 13em;
  }

  .c-index__event-item {
    width: 50%;
  }

  .c-index__flickr-photo {
    max-width: 15%;
  }
}

@media (--lg-and-up) {
  .c-index__event-item {
    width: 33%;
  }

  .c-index__event-item:nth-of-type(1n + 7) {
    display: block;
  }
}
</style>
