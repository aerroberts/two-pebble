import type { SelectOption } from '../../input/select/select';
import type { SidebarLayoutNavigationSection } from './types';

type SidebarLayoutNavigationSections = SidebarLayoutNavigationSection[];

export function buildSidebarLayoutMobileOptions(sections: SidebarLayoutNavigationSections): SelectOption[] {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      label: `${section.title} · ${item.label}`,
      value: item.href,
    })),
  );
}

export function findSidebarLayoutActiveHref(sections: SidebarLayoutNavigationSections, pathname: string) {
  return sections.flatMap((section) => section.items).find((item) => isSidebarLayoutItemActive(pathname, item.href))
    ?.href;
}

function isSidebarLayoutItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
