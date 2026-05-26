import { SidebarOption, SidebarSection } from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';

export function ExamplesSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarSection title="Examples">
      <SidebarOption
        active={location.pathname === '/examples'}
        icon="square-dashed-mouse-pointer"
        label="Overview"
        onClick={() => navigate('/examples')}
      />
    </SidebarSection>
  );
}
