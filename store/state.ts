export interface MenuItem {
  name: string;
  href?: string;
  children: MenuItem[];
}

export interface RootState {
  mainNavigation: MenuItem[];
}

export default (): RootState => ({
  mainNavigation: [],
});
