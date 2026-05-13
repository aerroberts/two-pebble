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
import { ConfigurationSidebar } from './configuration-sidebar';
import { DeveloperSidebar } from './developer-sidebar';
import { MetricsSidebar } from './metrics-sidebar';

type SidebarMode = 'main' | 'configuration' | 'metrics' | 'developer';
type SidebarNavigate = (path: string) => void;

export function MainAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = getSidebarMode(location.pathname);

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
          tone={mode === 'main' ? 'default' : 'auxiliary'}
        >
          {renderSidebarContent(mode, location.pathname, navigate)}
        </Sidebar>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}

function renderSidebarContent(mode: SidebarMode, pathname: string, navigate: SidebarNavigate) {
  if (mode === 'configuration') {
    return (
      <>
        <SidebarSection title={<TwoPebbleLogo withText text="Settings" />} />
        <ConfigurationSidebar />
      </>
    );
  }
  if (mode === 'metrics') {
    return (
      <>
        <SidebarSection title={<TwoPebbleLogo withText text="Metrics" />} />
        <MetricsSidebar />
      </>
    );
  }
  if (mode === 'developer') {
    return (
      <>
        <SidebarSection title={<TwoPebbleLogo withText text="Developer" />} />
        <DeveloperSidebar />
      </>
    );
  }
  return (
    <>
      <SidebarSection title={<TwoPebbleLogo withText text={getPageName(pathname)} />} />
      <SidebarSection title="Two Pebble">
        <SidebarOption
          active={pathname.startsWith('/assistant')}
          icon="messages-square"
          label="Assistant"
          onClick={() => navigate('/assistant')}
        />
        <SidebarOption
          active={pathname.startsWith('/agents') || pathname.startsWith('/threads')}
          icon="bot"
          label="Agents"
          onClick={() => navigate('/agents')}
        />
        <SidebarOption
          active={pathname.startsWith('/tasks')}
          icon="list-checks"
          label="Tasks"
          onClick={() => navigate('/tasks')}
        />
      </SidebarSection>
    </>
  );
}

function getSidebarMode(pathname: string): SidebarMode {
  if (pathname.startsWith('/configuration')) {
    return 'configuration';
  }
  if (pathname.startsWith('/metrics')) {
    return 'metrics';
  }
  if (pathname.startsWith('/developer')) {
    return 'developer';
  }
  return 'main';
}

function isHomeActive(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }
  return pathname.startsWith('/agents') || pathname.startsWith('/threads') || pathname.startsWith('/tasks');
}

function getPageName(pathname: string): string {
  if (pathname.startsWith('/configuration')) {
    return 'Settings';
  }
  if (pathname.startsWith('/metrics')) {
    return 'Metrics';
  }
  if (pathname.startsWith('/developer')) {
    return 'Developer';
  }
  return 'two pebble';
}
