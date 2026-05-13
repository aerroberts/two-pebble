'use client';

import { useEffect, useState } from 'react';

import { Select } from '../../input/select/select';
import { buildSidebarLayoutMobileOptions, findSidebarLayoutActiveHref } from './sidebar-layout-mobile-nav-utils';
import type { SidebarLayoutNavigationSection } from './types';

interface SidebarLayoutMobileNavProps {
  sections: SidebarLayoutNavigationSection[];
  pathname?: string;
}

export function SidebarLayoutMobileNav(props: SidebarLayoutMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = props.pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);

  useEffect(() => {
    if (pathname.length === 0) {
      return;
    }

    setOpen(false);
  }, [pathname]);

  return (
    <Select
      fullWidth
      open={open}
      mobilePresentation="drawer"
      onOpenChange={setOpen}
      options={buildSidebarLayoutMobileOptions(props.sections)}
      value={findSidebarLayoutActiveHref(props.sections, pathname)}
      onChange={(href) => {
        setOpen(false);
        window.location.assign(href);
      }}
    />
  );
}
