import { SidebarOption, SidebarSection } from '@two-pebble/components';
import { useLocation, useNavigate } from 'react-router-dom';

export function ConfigurationSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <SidebarSection title="Agents">
        <SidebarOption
          active={location.pathname.startsWith('/configuration/agent-registries')}
          icon="bot"
          label="Agent registry"
          onClick={() => navigate('/configuration/agent-registries')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/third-party-agents')}
          icon="braces"
          label="Third-party agents"
          onClick={() => navigate('/configuration/third-party-agents')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/inference-profiles')}
          icon="cpu"
          label="Inference profiles"
          onClick={() => navigate('/configuration/inference-profiles')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/integrations')}
          icon="plug"
          label="Integrations"
          onClick={() => navigate('/configuration/integrations')}
        />
      </SidebarSection>
      <SidebarSection title="Workspaces">
        <SidebarOption
          active={location.pathname.startsWith('/configuration/projects')}
          icon="folder"
          label="Projects"
          onClick={() => navigate('/configuration/projects')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/repositories')}
          icon="folder-open"
          label="Repositories"
          onClick={() => navigate('/configuration/repositories')}
        />
      </SidebarSection>
      <SidebarSection title="Configuration">
        <SidebarOption
          active={location.pathname.startsWith('/configuration/voice')}
          icon="mic"
          label="Voice"
          onClick={() => navigate('/configuration/voice')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/ide')}
          icon="code"
          label="IDE"
          onClick={() => navigate('/configuration/ide')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/assistant')}
          icon="messages-square"
          label="Assistant"
          onClick={() => navigate('/configuration/assistant')}
        />
        <SidebarOption
          active={location.pathname.startsWith('/configuration/documents')}
          icon="file-text"
          label="Documents"
          onClick={() => navigate('/configuration/documents')}
        />
      </SidebarSection>
      <SidebarSection title="Sharing">
        <SidebarOption
          active={location.pathname.startsWith('/configuration/data-sync')}
          icon="refresh-cw"
          label="Data Sync"
          onClick={() => navigate('/configuration/data-sync')}
        />
      </SidebarSection>
      <SidebarSection title="Appearance">
        <SidebarOption
          active={location.pathname === '/configuration/theme'}
          icon="palette"
          label="Theme"
          onClick={() => navigate('/configuration/theme')}
        />
      </SidebarSection>
    </>
  );
}
