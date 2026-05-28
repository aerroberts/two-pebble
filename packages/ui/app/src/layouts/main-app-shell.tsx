import {
  IconButton,
  ModalActions,
  Select,
  Sidebar,
  SidebarLayout,
  SidebarOption,
  SidebarSection,
  TwoPebbleLogo,
} from '@two-pebble/components';
import { useAgents, useDocuments, useProjects } from '@two-pebble/realtime';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectPath, useOptionalProject } from '../project-context';
import type { AppShellProps } from './app-shell-props';
import { ConfigurationSidebar } from './configuration-sidebar';
import { DeveloperSidebar } from './developer-sidebar';
import { ExamplesSidebar } from './examples-sidebar';
import { MetricsSidebar } from './metrics-sidebar';

type SidebarMode = 'main' | 'configuration' | 'metrics' | 'developer' | 'examples';
type SidebarNavigate = (path: string) => void;

const NEW_PROJECT_OPTION_VALUE = '__new__';

export function MainAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const projectContext = useOptionalProject();
  const projectId = projectContext?.projectId;
  const projects = useProjects();
  const agents = useAgents(projectId === undefined ? undefined : { projectId });
  const documents = useDocuments(projectId === undefined ? undefined : { projectId });
  const activeAgentCount = agents.values().filter((agent) => agent.status === 'running').length;
  const documentCount = documents.values().length;
  const pathname = projectId === undefined ? location.pathname : stripProjectPrefix(location.pathname, projectId);
  const mode = getSidebarMode(pathname);
  const scopedNavigate = (path: string) => navigate(projectId === undefined ? path : projectPath(projectId, path));

  return (
    <SidebarLayout
      sidebar={
        <Sidebar
          footer={
            <ModalActions align="left">
              <IconButton
                aria-label="Go home"
                icon="home"
                onClick={() => scopedNavigate('/')}
                variant={isHomeActive(pathname) ? 'primary' : 'secondary'}
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
              <IconButton
                aria-label="Open examples"
                icon="square-dashed-mouse-pointer"
                onClick={() => navigate('/examples')}
                variant={location.pathname.startsWith('/examples') ? 'primary' : 'secondary'}
              />
            </ModalActions>
          }
          tone={mode === 'main' ? 'default' : 'auxiliary'}
        >
          {renderSidebarContent({
            activeAgentCount,
            documentCount,
            globalNavigate: navigate,
            mode,
            navigate: scopedNavigate,
            pathname,
            projectId,
            projects,
          })}
        </Sidebar>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}

function renderSidebarContent(input: {
  activeAgentCount: number;
  documentCount: number;
  globalNavigate: SidebarNavigate;
  mode: SidebarMode;
  navigate: SidebarNavigate;
  pathname: string;
  projectId?: string;
  projects: ReturnType<typeof useProjects>;
}) {
  const { activeAgentCount, documentCount, globalNavigate, mode, navigate, pathname, projectId, projects } = input;
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
  if (mode === 'examples') {
    return (
      <>
        <SidebarSection title={<TwoPebbleLogo withText text="Examples" />} />
        <ExamplesSidebar />
      </>
    );
  }
  return (
    <>
      <SidebarSection
        title={
          projectId === undefined ? (
            <TwoPebbleLogo withText text={getPageName(pathname)} />
          ) : (
            <div className="flex w-full items-center gap-2">
              <TwoPebbleLogo />
              <Select
                fullWidth
                onChange={(nextProjectId) => {
                  if (nextProjectId === NEW_PROJECT_OPTION_VALUE) {
                    globalNavigate('/projects');
                    return;
                  }
                  globalNavigate(projectPath(nextProjectId, pathname));
                }}
                options={[
                  ...projects.values().map((project) => ({ label: project.name, value: project.id })),
                  { label: 'New Project', value: NEW_PROJECT_OPTION_VALUE },
                ]}
                value={projectId}
              />
            </div>
          )
        }
      />
      <SidebarSection title="Home">
        <SidebarOption
          active={pathname === '/'}
          icon="layout-dashboard"
          label="Overview"
          onClick={() => navigate('/')}
        />
        <SidebarOption
          active={pathname.startsWith('/assistant')}
          icon="messages-square"
          label="Assistant"
          onClick={() => navigate('/assistant')}
        />
      </SidebarSection>
      <SidebarSection title="System">
        <SidebarOption
          active={pathname.startsWith('/agents') || pathname.startsWith('/threads')}
          badge={
            activeAgentCount > 0 ? (
              <output aria-label={`${activeAgentCount} ${activeAgentCount === 1 ? 'agent' : 'agents'} active`}>
                {activeAgentCount} active
              </output>
            ) : undefined
          }
          icon="bot"
          label="Agents"
          onClick={() => navigate('/agents')}
        />
        <SidebarOption
          active={pathname.startsWith('/tasks')}
          icon="list-checks"
          label="Agent Tasks"
          onClick={() => navigate('/tasks')}
        />
        <SidebarOption
          active={pathname.startsWith('/documents')}
          badge={
            documentCount > 0 ? (
              <output aria-label={`${documentCount} ${documentCount === 1 ? 'document' : 'documents'}`}>
                {documentCount}
              </output>
            ) : undefined
          }
          icon="file-text"
          label="Documents"
          onClick={() => navigate('/documents')}
        />
        <SidebarOption
          active={pathname.startsWith('/automations')}
          icon="calendar-clock"
          label="Automations"
          onClick={() => navigate('/automations')}
        />
      </SidebarSection>
    </>
  );
}

function stripProjectPrefix(pathname: string, projectId: string): string {
  const prefix = `/project/${projectId}`;
  if (!pathname.startsWith(prefix)) {
    return pathname;
  }
  const stripped = pathname.slice(prefix.length);
  return stripped.length === 0 ? '/' : stripped;
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
  if (pathname.startsWith('/examples')) {
    return 'examples';
  }
  return 'main';
}

function isHomeActive(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }
  return (
    pathname.startsWith('/assistant') ||
    pathname.startsWith('/agents') ||
    pathname.startsWith('/threads') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/automations')
  );
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
  if (pathname.startsWith('/examples')) {
    return 'Examples';
  }
  return 'two pebble';
}
