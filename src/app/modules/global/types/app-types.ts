export interface AppPage {
  title: string;
  tabLabel: string;
  url: string;
  fragment: string;
  icon: string;
  isExternal: boolean;
  showInMenu: boolean;
}

export interface AppTab {
  label: string;
  tab: string;
  icon: string;
}