import slgfy from 'slugify';

export function useSlugify() {
  const slugify = (text: string) => slgfy(text, { lower: true });

  return {
    slugify,
  };
}
