import { SidebarOption, SidebarSection, SidebarSubitem } from '@two-pebble/components';
import { useProjects } from '@two-pebble/realtime';
import { useLocation, useNavigate } from 'react-router-dom';

export function ConfigurationSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const projects = useProjects();
  const projectsActive = location.pathname.startsWith('/configuration/projects');
  const projectList = projects.values().sort((left, right) => left.name.localeCompare(right.name));

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
          active={projectsActive}
          icon="folder"
          label="Projects"
          onClick={() => navigate('/configuration/projects')}
        />
        {projectsActive
          ? projectList.map((project) => (
              <SidebarSubitem
                active={location.pathname === `/configuration/projects/${project.id}`}
                key={project.id}
                label={project.name.length > 0 ? project.name : 'Untitled project'}
                onClick={() => navigate(`/configuration/projects/${project.id}`)}
              />
            ))
          : null}
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
