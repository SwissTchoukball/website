<template>
  <div>
    <section class="l-main-content-section">
      <st-home-carousel v-if="carouselItems" :items="carouselItems" class="c-index_carousel" />
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
            :details="event.venue ? event.venue.name + (event.venue.city ? `, ${event.venue.city}` : '') : ''"
            :to="
              localePath({
                name: 'event-slug',
                params: { slug: `${event.id}-${$slugify(event.name)}` },
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
      <div class="directus-formatted-content .directus-formatted-content--large" v-html="tchoukballDescription"></div>
      <nav>
        <ul class="c-index__tchoukball-nav u-unstyled-list">
          <li v-for="item of tchoukballNavigation" :key="item.name" class="c-index__tchoukball-nav-item">
            <nuxt-link :to="item.path[currentLocale]">{{ $t(`tchoukball.nav.${item.name}`) }}</nuxt-link>
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
      <st-link-action href="https://flickr.com/swisstchoukball" class="c-index__see-more-photos" with-arrow>
        {{ $t('photos.seeMore') }}
      </st-link-action>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaInfo } from 'vue-meta';
import { CarouselItem } from '~/components/st-home-carousel.vue';
import { CalendarEvent } from '~/plugins/cms-service';
import stEventSmall from '~/components/events/st-event-small.vue';
import stUpcomingMatches from '~/components/competitions/st-upcoming-matches.vue';
import { FlickrPhotoset } from '~/plugins/flickr';

export default defineComponent({
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
      tchoukballDescription: '',
      latestAlbums: [] as FlickrPhotoset[],
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
      forHomepage: true,
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

    this.tchoukballDescription = (await this.$cmsService.getText(1))?.body;

    // Latest Flickr photos
    // Doc: https://www.flickr.com/services/api/flickr.photosets.getList.html
    const flickrResponse = await this.$flickr.photosets.getList({
      user_id: this.$config.flickr.userId,
      per_page: 6,
      primary_photo_extras: 'url_q,url_m',
    });
    this.latestAlbums = flickrResponse.body.photosets.photoset;
  },
  head(): MetaInfo {
    return {
      meta: [{ property: 'og:title', content: this.$t('title').toString() }],
    };
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale as 'fr' | 'de';
    },
  },
});
</script>

<style scoped>
.c-index_carousel {
  margin-top: var(--st-length-spacing-xs);
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
