import Domain from '~/models/domain.model';

export interface NewsEntry {
  id: number;
  title: string;
  slug: string;
  main_image?: {
    id: string;
    description?: string;
  };
  body: string;
  date_created: string;
  date_updated?: string;
  domains: Domain[];
}
