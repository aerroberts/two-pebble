import { SidebarOption, SidebarSection } from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';
import { EXAMPLE_DOC_PAGES } from '../pages/examples/examples.page';

export function ExamplesSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarSection title="Pages">
      {EXAMPLE_DOC_PAGES.map((page, index) => {
        const href = index === 0 ? '/examples' : `/examples/${page.id}`;
        return (
          <SidebarOption
            key={page.id}
            active={location.pathname === href || (index === 0 && location.pathname === `/examples/${page.id}`)}
            icon={page.icon}
            label={page.title}
            onClick={() => navigate(href)}
          />
        );
      })}
    </SidebarSection>
  );
}
