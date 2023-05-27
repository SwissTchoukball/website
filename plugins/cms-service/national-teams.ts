import { PartialItem } from '@directus/sdk';
import { DirectusPlayer } from '../directus';

export const processRawPlayers = (rawPlayers: (PartialItem<DirectusPlayer> | undefined)[] | undefined) => {
  if (!rawPlayers) {
    return [];
  }

  const players = rawPlayers.map((player) => {
    if (player?.positions) {
      return {
        ...player,
        positions: player.positions.map((position) => {
          if (position) {
            return position.player_positions_id;
          }
          return position;
        }),
      };
    }
    return player;
  });

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
