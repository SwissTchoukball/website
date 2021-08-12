export interface MenuItem {
  name: string;
  href?: string;
  children: MenuItem[];
}

export interface EventCategory {
  id: number;
  name: string;
}

export interface EventCategories {
  [id: number]: EventCategory;
}

export interface RootState {
  mainNavigation: MenuItem[];
  eventCategories?: EventCategories;
}

export default (): RootState => ({
  mainNavigation: [],
  eventCategories: undefined,
});
