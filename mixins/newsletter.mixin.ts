import Vue from 'vue';

export type NewsletterSlug = 'general' | 'instructors';

export default Vue.extend({
  asyncData({ route }) {
    let newsletterName = 'general';
    if (route.query.name === 'instructors') {
      newsletterName = route.query.name;
    }
    return {
      selectedNewsletter: newsletterName,
    };
  },
  data() {
    return {
      selectedNewsletter: 'general' as NewsletterSlug,
    };
  },
});
