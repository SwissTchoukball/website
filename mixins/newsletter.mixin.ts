import Vue from 'vue';

const newsletterSlugs = ['general', 'instructors', 'medias-fr', 'medias-de'];

export type NewsletterSlug = (typeof newsletterSlugs)[number];

export default Vue.extend({
  asyncData({ route }) {
    return {
      selectedNewsletter:
        typeof route.query.name === 'string' && newsletterSlugs.includes(route.query.name)
          ? route.query.name
          : 'general',
    };
  },
  data() {
    return {
      selectedNewsletter: 'general' as NewsletterSlug,
    };
  },
});
