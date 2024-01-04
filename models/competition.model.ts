import { PartialItem } from '@directus/sdk';
import { NationalCompetitionEdition } from '~/plugins/cms-service';
import { DirectusNationalCompetition, getTranslatedFields } from '~/plugins/directus';

export default class Competition {
  static entity = 'competitions';

  readonly id: number;
  name: string;
  slug: string;
  editions?: NationalCompetitionEdition[];

  constructor(rawCompetition: PartialItem<DirectusNationalCompetition>) {
    const translatedFields = getTranslatedFields(rawCompetition);

    if (!rawCompetition.id || !translatedFields?.name || !translatedFields?.slug) {
      throw new Error('Competition is missing requested fields');
    }

    // Fallback for mandatory fields should not happen as we requested those fields

    this.id = rawCompetition.id;
    this.name = translatedFields.name;
    this.slug = translatedFields.slug;
    this.editions = (rawCompetition.editions as any) || [];
  }

  get lastEdition() {
    if (!this.editions || !this.editions.length) {
      return null;
    }

    // FIXME: This is a naive selection of the last edition. It might not work, i.e. when adding older editions.
    return this.editions[this.editions.length - 1];
  }
}
