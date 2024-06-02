import { defineStore } from 'pinia';

export interface PlayerPosition {
  id: number;
  name: string;
  name_feminine: string;
  name_masculine: string;
}

export interface PlayerPositions {
  [id: number]: PlayerPositions;
}

export const useNationalTeamsStore = defineStore('national-teams', () => {
  const playerPositions = ref<PlayerPositions>();

  const loadPlayerPositions = async () => {
    playerPositions.value = await this.$cmsService.getPlayerPositions();
  };

  return {
    playerPositions,
    loadPlayerPositions,
  };
});
