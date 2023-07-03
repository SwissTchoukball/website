export interface PressRelease {
  id: number;
  date_created: string;
  date_updated?: string;
  context?: string;
  title: string;
  slug: string;
  body?: string;
}
