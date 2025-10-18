const newsletterSlugs = ['general', 'instructors', 'medias-fr', 'medias-de'];

export type NewsletterSlug = (typeof newsletterSlugs)[number];

export function useNewsletter() {
  const route = useRoute();

  const selectedNewsletter = ref('general');

  selectedNewsletter.value =
    typeof route.query.name === 'string' && newsletterSlugs.includes(route.query.name) ? route.query.name : 'general';

  return {
    selectedNewsletter,
  };
}
