<template>
  <footer class="c-footer">
    <section class="l-main-content-section c-footer__social">
      <div class="c-footer__social-icons">
        <a href="https://instagram.com/swisstchoukball" class="c-footer__social-icon c-footer__social-icon--instagram">
          <fa-icon :icon="['fab', 'instagram']" />
        </a>
        <a href="https://facebook.com/swisstchoukball" class="c-footer__social-icon c-footer__social-icon--facebook">
          <fa-icon :icon="['fab', 'facebook']" />
        </a>
        <a href="https://twitter.com/swisstchoukball" class="c-footer__social-icon c-footer__social-icon--twitter">
          <fa-icon :icon="['fab', 'twitter']" />
        </a>
        <a href="https://flickr.com/swisstchoukball" class="c-footer__social-icon c-footer__social-icon--flickr">
          <st-icon-flickr />
        </a>
        <a href="https://youtube.com/@swisstchoukball" class="c-footer__social-icon c-footer__social-icon--youtube">
          <fa-icon :icon="['fab', 'youtube']" />
        </a>
        <a :href="rssFeedUrl" class="c-footer__social-icon c-footer__social-icon--rss">
          <fa-icon icon="square-rss" />
        </a>
      </div>
      <div class="c-footer__tchouksuisse">#tchouksuisse</div>
    </section>

    <nav class="l-main-content-section c-footer__secondary-navigation">
      <h2 class="u-visually-hidden">{{ $t('secondaryNavigation') }}</h2>
      <!-- TODO: Replace with st-navigation component, adapted for the usage here -->
      <ul class="u-unstyled-list c-footer__secondary-navigation__list">
        <li v-for="item in secondaryNavigation" :key="item.name" class="c-footer__secondary-navigation__item">
          <a v-if="item.isExternal" :href="item.href" class="c-footer__secondary-navigation__link">
            {{ item.name }}
          </a>
          <nuxt-link v-else :to="localePath(item.href)" class="c-footer__secondary-navigation__link">
            {{ item.name }}
          </nuxt-link>
        </li>
      </ul>
    </nav>

    <nuxt-link :to="localePath('newsletter')" class="c-footer__newsletter">{{ $t('footer.newsletterLink') }}</nuxt-link>

    <section class="l-main-content-section">
      <h2 class="c-footer__heading">{{ $t('footer.partners') }}</h2>
      <div class="c-footer__org-logos">
        <a v-for="partner of partners" :key="partner.slug" :href="partner.href">
          <img
            :src="`/images/logo-${partner.slug}.svg`"
            :alt="$t('footer.logoFrom', { orgName: partner.name })"
            :title="partner.name"
            class="c-footer__org-logo"
          />
        </a>
      </div>
      <h2 class="c-footer__heading">{{ $t('footer.affiliations') }}</h2>
      <div class="c-footer__org-logos">
        <a v-for="affiliation of affiliations" :key="affiliation.slug" :href="affiliation.href">
          <img
            :src="`/images/logo-${affiliation.slug}.svg`"
            :alt="$t('footer.logoFrom', { orgName: affiliation.name })"
            :title="affiliation.name"
            class="c-footer__org-logo"
          />
        </a>
      </div>
      <p class="c-footer__copyright">
        &copy; {{ new Date().getFullYear() }} {{ $t('title') }}, {{ $t('footer.allRightsReserved') }} -
        <nuxt-link :to="localePath('impressum')">Impressum</nuxt-link>
      </p>
    </section>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue';
import stIconFlickr from '~/components/icon/st-icon-flickr.vue';

export default Vue.extend({
  components: { stIconFlickr },
  data() {
    return {
      partners: [
        {
          name: 'Tchoukball Promotion',
          slug: 'tchoukball-promotion',
          href: 'http://www.tchouk.com',
        },
        {
          name: 'Infomaniak',
          slug: 'infomaniak',
          href: 'https://infomaniak.ch',
        },
        {
          name: 'Axanova',
          slug: 'axanova',
          href: 'https://axanova.ch',
        },
      ],
      affiliations: [
        {
          name: 'Swiss Olympic Member',
          slug: 'swiss-olympic-member',
          href: 'https://swissolympic.ch',
        },
        {
          name: 'European Tchoukball Federation',
          slug: 'etbf',
          href: 'http://tchoukball.eu',
        },
        {
          name: 'International Tchoukball Federation',
          slug: 'fitb',
          href: 'http://tchoukball.org',
        },
      ],
    };
  },
  computed: {
    rssFeedUrl() {
      return `https://feeds.tchoukball.ch/news-${this.$i18n.locale}.xml`;
    },
    secondaryNavigation() {
      return this.$store.state.secondaryNavigation;
    },
  },
});
</script>

<style scoped>
.c-footer {
  margin-top: var(--st-length-spacing-m);
  padding-bottom: var(--st-length-spacing-s);
  text-align: center;
}

.c-footer__social {
  background-color: var(--st-color-footer-social-background);
}

.c-footer__social-icons {
  font-size: 2em;
}

.c-footer__social-icon {
  display: inline-block;
  padding: 0.8rem 0.3rem 0.5rem;
}

.c-footer__social-icon--twitter {
  color: #1d9bf0;
}

.c-footer__social-icon--facebook {
  color: #1877f2;
}

.c-footer__social-icon--instagram {
  color: black;
}

.c-footer__social-icon--flickr {
  transform: translateY(0.2rem);
}

.c-footer__social-icon--youtube {
  color: red;
}

.c-footer__social-icon--rss {
  color: #f26522;
}

.c-footer__tchouksuisse {
  font-weight: 900;
  font-size: 2em;
  color: var(--st-color-footer-tchouksuisse);
}

.c-footer__secondary-navigation {
  background-color: red;
  padding: var(--st-length-spacing-xs) 0;
}

.c-footer__secondary-navigation__list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.c-footer__secondary-navigation__item {
  padding: calc(var(--st-length-spacing-xs) / 2) var(--st-length-spacing-s);
}

.c-footer__secondary-navigation__link {
  color: white;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 900;
}

.c-footer__newsletter {
  display: inline-block;
  margin-top: var(--st-length-spacing-m);
  padding: var(--st-length-spacing-xxs);
  color: var(--st-color-footer-newsletter);
  font-weight: bold;
  text-decoration: none;
  border: 2px solid var(--st-color-footer-newsletter);
}

.c-footer__newsletter:hover {
  color: var(--st-color-footer-newsletter-hover);
  background-color: var(--st-color-footer-newsletter);
}

.c-footer__heading {
  font-weight: 900;
  text-transform: uppercase;
  font-size: 1.5em;
  padding: var(--st-length-spacing-l) 0 var(--st-length-spacing-s) 0;
}

.c-footer__org-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.c-footer__org-logo {
  display: inline-block;
  margin: var(--st-length-spacing-xs) var(--st-length-spacing-s);
  height: 3.5rem;
  object-fit: contain;
}

.c-footer__org-logo[src*='infomaniak'] {
  max-width: 10rem;
}

.c-footer__org-logo[src*='etbf'] {
  min-width: 4rem;
}

.c-footer__copyright {
  margin-top: var(--st-length-spacing-m);
  font-size: 0.8em;
}

@media (--lg-and-up) {
  .c-footer__org-logo {
    height: 4rem;
  }

  .c-footer__org-logo[src*='infomaniak'] {
    max-width: 11.5rem;
  }
}
</style>
