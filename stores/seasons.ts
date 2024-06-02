import { defineStore } from 'pinia';
import Season from '~/models/season.model';

export const useSeasonsStore = defineStore('seasons', () => {
  const nuxtApp = useNuxtApp();
  const seasons = ref<Season[]>([]);

  const loadSeasons = async () => {
    const directusSeasons = await nuxtApp.$cmsService.getSeasons();
    seasons.value = directusSeasons.map((season) => new Season(season));
  };

  const findSeason = (predicate: (value: Season) => unknown): Season | undefined => {
    const season = seasons.value.find(predicate);
    if (!season) {
      return;
    }
    return season;
  };

  const currentSeason = computed<Season | undefined>(() => {
    const today = new Date().toISOString().substring(0, 10);
    return findSeason((season: Season) => season.date_start <= today && season.date_end >= today);
  });

  const getSeasonBySlug = (slug: string): Season | undefined => {
    return findSeason((season: Season) => season.slug === slug);
  };

  const getSeasonByLeveradeId = (leveradeId: string): Season | undefined => {
    return findSeason((season: Season) => season.leverade_id && season.leverade_id.toString() === leveradeId);
  };

  return {
    seasons,
    loadSeasons,
    currentSeason,
    getSeasonBySlug,
    getSeasonByLeveradeId,
  };
});
