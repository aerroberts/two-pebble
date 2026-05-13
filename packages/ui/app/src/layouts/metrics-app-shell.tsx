import {
  AuxiliarySidebarLayout,
  IconButton,
  ModalActions,
  Sidebar,
  SidebarOption,
  SidebarSection,
} from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

function isMetricsExplorerActive(pathname: string): boolean {
  if (pathname === '/metrics') return true;
  if (pathname.startsWith('/metrics/pricing')) return false;
  return pathname.startsWith('/metrics/');
}

export function MetricsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar
            footer={
              <ModalActions align="left">
                <IconButton
                  aria-label="Go back"
                  icon="chevron-left"
                  onClick={() => navigate('/')}
                  variant="secondary"
                />
              </ModalActions>
            }
            tone="auxiliary"
          >
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
                active={
                  location.pathname.startsWith('/metrics/pricing/overview') || location.pathname === '/metrics/pricing'
                }
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
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}
