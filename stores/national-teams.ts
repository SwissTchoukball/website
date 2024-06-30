import { defineStore } from 'pinia';

export interface PlayerPosition {
  id: number;
  name: string;
  name_feminine: string;
  name_masculine: string;
}

export interface PlayerPositions {
  [id: number]: PlayerPosition;
}

export const useNationalTeamsStore = defineStore('national-teams', () => {
  const nuxtApp = useNuxtApp();
  const playerPositions = ref<PlayerPositions>();

  const loadPlayerPositions = async () => {
    playerPositions.value = await nuxtApp.$cmsService.getPlayerPositions();
  };

  return {
    playerPositions,
    loadPlayerPositions,
  };
});
