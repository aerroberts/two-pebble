import { SidebarOption, SidebarSection } from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';

export function MetricsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <SidebarSection title="Metrics">
        <SidebarOption
          active={isMetricsExplorerActive(location.pathname)}
          icon="chart-no-axes-combined"
          label="Explorer"
          onClick={() => navigate('/metrics')}
        />
      </SidebarSection>
      <SidebarSection title="Pricing">
        <SidebarOption
          active={location.pathname.startsWith('/metrics/pricing/overview') || location.pathname === '/metrics/pricing'}
          icon="layout-dashboard"
          label="Overview"
          onClick={() => navigate('/metrics/pricing/overview')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/metrics/pricing/explorer')}
          icon="compass"
          label="Explorer"
          onClick={() => navigate('/metrics/pricing/explorer')}
        />
      </SidebarSection>
    </>
  );
}

function isMetricsExplorerActive(pathname: string): boolean {
  if (pathname === '/metrics') {
    return true;
  }
  if (pathname.startsWith('/metrics/pricing')) {
    return false;
  }
  return pathname.startsWith('/metrics/');
}
