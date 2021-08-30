import { ManyItems } from '@directus/sdk';
import { Model } from '@vuex-orm/core';
import { DirectusClub } from '~/plugins/directus';

export default class Club extends Model {
  static entity = 'clubs';

  id!: number;
  name!: string;
  name_full!: string;
  name_sort!: string;
  status!: string;
  website!: string;
  logo!: string;

  static fields() {
    return {
      id: this.number(null),
      name: this.string(null),
      name_full: this.string(null),
      name_sort: this.string(null),
      status: this.string(null),
      website: this.string(null).nullable(),
      logo: this.string(null).nullable(),
    };
  }

  get websiteDisplay() {
    if (!this.website) {
      return null;
    }
    const result = this.website.match(/http(?:s?):\/\/(?:www\.)?(.*)/);
    if (result && result.length >= 2) {
      return result[1];
    }
    return this.website;
  }

  static addManyFromDirectus(clubsResponse: ManyItems<DirectusClub>) {
    if (!clubsResponse.data) {
      throw new Error('Error when retrieving clubs');
    }

    const clubs = clubsResponse.data.reduce((clubs, club) => {
      // We discard entries that don't have mandatory data.
      if (!club.id || !club.name || !club.name_full || !club.name_sort || !club.status) {
        console.warn('Club missing mandatory data', { club });
        return clubs;
      }

      return [
        ...clubs,
        {
          id: club.id,
          name: club.name,
          name_full: club.name_full,
          name_sort: club.name_sort,
          status: club.status,
          website: club.website,
          logo: club.logo,
        },
      ];
    }, [] as any[]);

    this.insert({ data: clubs });
  }
}
