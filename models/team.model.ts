import { LeveradeTeam } from '~/plugins/leverade';

export default class Team {
  static entity = 'teams';

  id: string;
  name: string;
  avatarKey?: string;

  constructor(leveradeTeam: LeveradeTeam) {
    const avatarKeyMatchArray = leveradeTeam.meta?.avatar?.large?.match(/\/(\w+)\.[0-9]/);

    this.id = leveradeTeam.id;
    this.name = leveradeTeam.attributes.name;
    this.avatarKey = avatarKeyMatchArray && avatarKeyMatchArray?.length > 1 ? avatarKeyMatchArray[1] : undefined;
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
    } else if (this.name.includes('Val-de-Ruz Black Kites')) {
      slug = 'val-de-ruz_black_kites';
    } else if (this.name.includes('La Chaux-de-Fonds Beehives')) {
      slug = 'la_chaux-de-fonds_beehives';
    } else if (this.name.includes('Nyon Lakers')) {
      slug = 'nyon_lakers';
    } else if (this.name.includes('Delémont Blizzard')) {
      slug = 'delemont_blizzard';
    } else if (this.name.includes('Delémont Thunder')) {
      slug = 'delemont_thunder';
    } else if (this.name.includes('Vernier Turtles B')) {
      slug = 'vernier_turtles_b';
    } else if (this.name.includes('Vernier Turtles')) {
      slug = 'vernier_turtles';
    } else if (this.name.includes('Team Vaud')) {
      slug = 'team_vaud';
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
