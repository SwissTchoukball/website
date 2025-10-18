import type { DirectusSeason } from '~/plugins/06.directus';

export default class Season {
  static entity = 'seasons';

  id: number;
  leverade_id?: string;
  name: string;
  slug: string;
  date_start: string;
  date_end: string;

  constructor(season: DirectusSeason) {
    this.id = season.id;
    this.leverade_id = season.leverade_id ? season.leverade_id.toString() : undefined;
    this.name = season.name;
    this.slug = season.slug;
    this.date_start = season.date_start;
    this.date_end = season.date_end;
  }

  get year_start(): number {
    return parseInt(this.date_start.substring(0, 4));
  }
}
