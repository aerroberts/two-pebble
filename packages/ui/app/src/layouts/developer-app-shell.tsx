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

export function DeveloperAppShell(props: AppShellProps) {
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
            <SidebarSection title="Developer">
              <SidebarOption
                active={location.pathname.startsWith('/developer/daemon-logs')}
                icon="file-text"
                label="Daemon Logs"
                onClick={() => navigate('/developer/daemon-logs')}
              />
              <SidebarOption
                active={location.pathname === '/developer/database'}
                icon="database"
                label="Database"
                onClick={() => navigate('/developer/database')}
              />
            </SidebarSection>
            <SidebarSection title="Agents">
              <SidebarOption
                active={location.pathname === '/developer/agents'}
                icon="bot"
                label="Agents"
                onClick={() => navigate('/developer/agents')}
              />
              <SidebarOption
                active={location.pathname.startsWith('/developer/agents/signals')}
                icon="radio"
                label="Signals"
                onClick={() => navigate('/developer/agents/signals')}
              />
              <SidebarOption
                active={location.pathname.startsWith('/developer/agents/thread-log')}
                icon="message-square"
                label="Thread Log"
                onClick={() => navigate('/developer/agents/thread-log')}
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
