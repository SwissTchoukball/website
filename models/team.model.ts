import { Model } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';
import Match from '~/models/match.model';

export default class Team extends Model {
  static entity = 'teams';

  id!: string;
  name!: string;
  avatarKey?: string;

  static fields() {
    return {
      id: this.string(null),
      name: this.string(null),
      avatarKey: this.string(null).nullable(),
      competition_edition_id: this.string(null),
      competition_edition: this.belongsTo(CompetitionEdition, 'competition_edition_id'),
      home_matches: this.hasMany(Match, 'home_team_id'),
      away_matches: this.hasMany(Match, 'away_team_id'),
    };
  }

  get avatarBaseUrl(): string | null {
    if (!this.avatarKey) {
      return null;
    }

    // Hard-coded override for teams that have a different logo than their club
    let slug;
    if (this.name.includes('Geneva Dragons')) {
      slug = 'geneva_dragons';
    } else if (this.name.includes('Geneva Flames')) {
      slug = 'geneva_flames';
    } else if (this.name.includes('Val-de-Ruz Flyers')) {
      slug = 'val-de-ruz_flyers';
    } else if (this.name.includes('La Chaux-de-Fonds Beehives')) {
      slug = 'la_chaux-de-fonds_beehives';
    } else if (this.name.includes('Nyon Lakers')) {
      slug = 'nyon_lakers';
    }

    if (slug) {
      return `https://files.tchoukball.ch/static/competition-teams-logos/${slug}`;
    }

    return `https://cdn.leverade.com/thumbnails/${this.avatarKey}`;
  }

  get avatarMediumUrl(): string | null {
    if (!this.avatarBaseUrl) {
      return null;
    }
    return `${this.avatarBaseUrl}.200x200.jpg`;
  }

  get avatarLargeUrl(): string | null {
    if (!this.avatarBaseUrl) {
      return null;
    }
    return `${this.avatarBaseUrl}.500x500.jpg`;
  }
}
