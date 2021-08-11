<template>
  <div>
    <section class="l-main-content-section">
      <st-home-carousel :items="carouselItems" />
      <nuxt-link :to="localePath('news')" class="c-index__read-more-news">{{ $t('news.readMore') }}</nuxt-link>
    </section>
    <section class="l-main-content-section">
      <h2 class="t-headline-1">{{ $t('events.title') }}</h2>
      <p>TODO: Prochains événements</p>
    </section>
    <section class="l-main-content-section c-index__competitions">
      <h2 class="t-headline-1">{{ $t('competitions.title') }}</h2>
      <p>TODO: Prochains matchs et derniers résultats</p>
    </section>
    <section class="l-main-content-section">
      <h2 class="t-headline-1">Tchoukball</h2>
      <p class="t-paragraph t-paragraph--large" v-html="$t('tchoukball.description')"></p>
      <nav>
        <ul class="c-index__tchoukball-nav u-unstyled-list">
          <li v-for="item of tchoukballNavigation" :key="item.name" class="c-index__tchoukball-nav-item">
            <nuxt-link :to="item.path[$i18n.locale]">{{ $t(`tchoukball.nav.${item.name}`) }}</nuxt-link>
          </li>
        </ul>
      </nav>
    </section>
    <section class="l-main-content-section">
      <h2 class="t-headline-1">Photos</h2>
      <!-- TODO: Is the title really necessary here ? -->
      <p>TODO: Dernières photos Flickr</p>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CarouselItem } from '~/components/st-home-carousel.vue';

export default Vue.extend({
  data() {
    return {
      amountNewsInCarousel: 5,
      carouselItems: [] as CarouselItem[],
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
  },
});
</script>

<style scoped>
.c-index__read-more-news {
  display: block;
  text-align: right;
}

.c-index__competitions {
  background-color: var(--st-color-main-content-alternative-background);
}

.c-index__tchoukball-nav {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.c-index__tchoukball-nav-item {
  margin: var(--st-length-spacing-xs);
}
</style>
