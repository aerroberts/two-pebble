import {
  IconButton,
  ModalActions,
  Sidebar,
  SidebarLayout,
  SidebarOption,
  SidebarSection,
  TwoPebbleLogo,
} from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellProps } from './app-shell-props';

export function MainAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarLayout
      sidebar={
        <Sidebar
          footer={
            <ModalActions align="left">
              <IconButton
                aria-label="Go home"
                icon="home"
                onClick={() => navigate('/')}
                variant={isHomeActive(location.pathname) ? 'primary' : 'secondary'}
              />
              <IconButton
                aria-label="Open configuration"
                icon="settings"
                onClick={() => navigate('/configuration')}
                variant={location.pathname.startsWith('/configuration') ? 'primary' : 'secondary'}
              />
              <IconButton
                aria-label="Open metrics"
                icon="chart-no-axes-combined"
                onClick={() => navigate('/metrics')}
                variant={location.pathname.startsWith('/metrics') ? 'primary' : 'secondary'}
              />
              <IconButton
                aria-label="Open developer tools"
                icon="bug"
                onClick={() => navigate('/developer')}
                variant={location.pathname.startsWith('/developer') ? 'primary' : 'secondary'}
              />
            </ModalActions>
          }
        >
          <SidebarSection title={<TwoPebbleLogo withText text={getPageName(location.pathname)} />}>
            <SidebarOption
              active={location.pathname.startsWith('/assistant')}
              icon="messages-square"
              label="Assistant"
              onClick={() => navigate('/assistant')}
            />
            <SidebarOption
              active={location.pathname.startsWith('/agents') || location.pathname.startsWith('/threads')}
              icon="bot"
              label="Agents"
              onClick={() => navigate('/agents')}
            />
            <SidebarOption
              active={location.pathname.startsWith('/tasks')}
              icon="list-checks"
              label="Tasks"
              onClick={() => navigate('/tasks')}
            />
          </SidebarSection>
        </Sidebar>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}

function isHomeActive(pathname: string): boolean {
  if (pathname === '/') return true;
  return pathname.startsWith('/agents') || pathname.startsWith('/threads') || pathname.startsWith('/tasks');
}

function getPageName(pathname: string): string {
  if (pathname.startsWith('/configuration')) return 'Settings';
  if (pathname.startsWith('/metrics')) return 'Metrics';
  if (pathname.startsWith('/developer')) return 'Developer';
  return 'two pebble';
}
