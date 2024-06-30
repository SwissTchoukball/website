import { defineStore } from 'pinia';
import Season from '~/models/season.model';
import type { DirectusSeason } from '~/plugins/06.directus';

export const useSeasonsStore = defineStore('seasons', () => {
  const nuxtApp = useNuxtApp();
  const seasons = ref<DirectusSeason[]>([]);

  const loadSeasons = async () => {
    seasons.value = await nuxtApp.$cmsService.getSeasons();
  };

  const findSeason = (predicate: (value: DirectusSeason) => unknown): Season | undefined => {
    const season = seasons.value.find(predicate);
    if (!season) {
      return;
    }
    return new Season(season);
  };

  const currentSeason = computed<Season | undefined>(() => {
    const today = new Date().toISOString().substring(0, 10);
    return findSeason((season: DirectusSeason) => season.date_start <= today && season.date_end >= today);
  });

  const getSeasonBySlug = (slug: string): Season | undefined => {
    return findSeason((season: DirectusSeason) => season.slug === slug);
  };

  const getSeasonByLeveradeId = (leveradeId: string): Season | undefined => {
    return findSeason((season: DirectusSeason) => season.leverade_id && season.leverade_id.toString() === leveradeId);
  };

  return {
    seasons,
    loadSeasons,
    currentSeason,
    getSeasonBySlug,
    getSeasonByLeveradeId,
  };
});
