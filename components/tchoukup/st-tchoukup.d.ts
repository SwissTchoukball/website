import type { DirectusFile, DirectusImage } from '~/plugins/06.directus';

export interface Tchoukup {
  id: number;
  number: string;
  releaseDate?: string;
  cover?: DirectusImage;
  file: DirectusFile;
}
