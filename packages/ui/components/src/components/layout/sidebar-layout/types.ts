export interface SidebarLayoutNavigationItem {
  label: string;
  href: string;
}

export interface SidebarLayoutNavigationSection {
  icon: string;
  title: string;
  items: SidebarLayoutNavigationItem[];
}
