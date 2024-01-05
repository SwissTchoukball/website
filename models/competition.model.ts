import { NationalCompetition, NationalCompetitionEdition } from '~/plugins/cms-service';

export default class Competition {
  static entity = 'competitions';

  readonly id: number;
  name: string;
  slug: string;
  editions?: NationalCompetitionEdition[];

  constructor(rawCompetition: NationalCompetition) {
    this.id = rawCompetition.id;
    this.name = rawCompetition.name;
    this.slug = rawCompetition.slug;
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
