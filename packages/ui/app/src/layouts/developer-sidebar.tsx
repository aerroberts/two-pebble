import { SidebarOption, SidebarSection } from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';

export function DeveloperSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
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
        <SidebarOption
          active={location.pathname === '/developer/heartbeats'}
          icon="activity"
          label="Heartbeats"
          onClick={() => navigate('/developer/heartbeats')}
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
          active={location.pathname === '/developer/agents/archived'}
          icon="inbox"
          label="Archived"
          onClick={() => navigate('/developer/agents/archived')}
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
      <SidebarSection title="Voice">
        <SidebarOption
          active={location.pathname.startsWith('/developer/voice/transcriptions')}
          icon="mic"
          label="Transcriptions"
          onClick={() => navigate('/developer/voice/transcriptions')}
        />
      </SidebarSection>
    </>
  );
}
