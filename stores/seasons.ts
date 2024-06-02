import { defineStore } from 'pinia';
import { type DirectusSeason } from '~/plugins/directus';
import Season from '~/models/season.model';

export const useSeasonsStore = defineStore('seasons', () => {
  const seasons = ref<DirectusSeason[]>([]);

  const loadSeasons = async () => {
    const directusSeasons = await this.$cmsService.getSeasons();
    seasons.value = directusSeasons.map((season) => new Season(season));
  };

  const findSeason = (
    predicate: (value: DirectusSeason, index: number, obj: DirectusSeason[]) => unknown,
  ): Season | undefined => {
    const rawSeason = seasons.value.find(predicate);
    if (!rawSeason) {
      return;
    }
    return new Season(rawSeason);
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
