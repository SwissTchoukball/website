export interface PressRelease {
  id: number;
  date_created: string;
  date_updated?: string;
  status: string;
  context?: string;
  title: string;
  slug: string;
  body?: string;
}
