import { DirectusFile, DirectusImage } from '~/plugins/directus';

export interface Tchoukup {
  id: number;
  number: string;
  releaseDate?: string;
  cover?: DirectusImage;
  file: DirectusFile;
}
