import { DirectusPerson, DirectusPlayer } from '../directus';
import { Gender } from '../cms-service';
import { Player } from '~/components/national-teams/st-national-teams.prop';

export const processRawPlayers = (rawPlayers: (DirectusPlayer | undefined)[] | undefined): Player[] => {
  if (!rawPlayers) {
    return [];
  }

  const players: Player[] = rawPlayers.reduce((playersAcc, player) => {
    if (!player?.id || !player.positions || !player.first_name || !player.last_name) {
      return playersAcc;
    }

    return [
      ...playersAcc,
      {
        ...player,
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        is_captain: !!player.is_captain,
        gender: player.gender as Gender,
        club: player.club?.name ? { name: player.club.name } : undefined,
        positions:
          player.positions.reduce((positions, position) => {
            if (position?.player_positions_id) {
              return [...positions, position.player_positions_id];
            }
            return positions;
          }, [] as number[]) || [],
      },
    ];
  }, [] as Player[]);

  // We sort the players because the API can't do it yet (only at the root)
  // Captain first, then alphabetically by last name, and then first name.
  return players.sort((playerA, playerB) => {
    return (
      +(playerB?.is_captain || 0) - +(playerA?.is_captain || 0) ||
      (playerA?.last_name || '').localeCompare(playerB?.last_name || '') ||
      (playerA?.first_name || '').localeCompare(playerB?.first_name || '')
    );
  });
};

export const processRawCoaches = (rawCoaches: (DirectusPerson | undefined)[] | undefined): DirectusPerson[] => {
  if (!rawCoaches) {
    return [];
  }

  return rawCoaches.reduce((coaches, coach) => {
    if (!coach) {
      return coaches;
    }
    return [...coaches, coach];
  }, [] as DirectusPerson[]);
};
