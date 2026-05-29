import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import {
  type AgentRecord,
  useAgents,
  useCompleteAgent,
  useFailAgent,
  useResumeAgent,
  useStopAgent,
} from '@two-pebble/realtime';
import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../project-context';
import { AgentSidebarItem, AgentSidebarSubitem } from './agent-sidebar-item';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function AgentsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = useProjectId();
  const agents = useAgents({ projectId });
  const stopAgent = useStopAgent();
  const completeAgent = useCompleteAgent();
  const resumeAgent = useResumeAgent();
  const failAgent = useFailAgent();
  const agentList = agents.values().sort((left, right) => right.startedAt - left.startedAt);
  const topLevelAgents = agentList.filter((agent) => !agent.parentAgentId);
  const childrenByParentId = buildDirectChildrenByParentId(agentList, topLevelAgents);
  const activeAgents = topLevelAgents.filter((agent) => agent.status === 'running');
  const waitingAgents = topLevelAgents.filter((agent) => agent.status === 'waiting');
  const idleAgents = topLevelAgents.filter((agent) => agent.status === 'idle');
  const interruptedAgents = topLevelAgents.filter((agent) => agent.status === 'interrupted');

  const handleStop = (agentId: string) => {
    void stopAgent({ agentId, reason: 'user stop from sidebar' }).catch(() => undefined);
  };

  const handleArchive = (agentId: string) => {
    void completeAgent({ id: agentId }).catch(() => undefined);
  };

  const handleResume = (agentId: string) => {
    void resumeAgent({ id: agentId }).catch(() => undefined);
  };

  const handleFail = (agentId: string) => {
    void failAgent({ id: agentId }).catch(() => undefined);
  };

  const renderAgentBranch = (agent: AgentRecord) => (
    <Fragment key={agent.id}>
      <AgentSidebarItem
        active={location.pathname === projectPath(projectId, `/agents/${agent.id}`)}
        agent={agent}
        onArchive={() => handleArchive(agent.id)}
        onFail={() => handleFail(agent.id)}
        onResume={() => handleResume(agent.id)}
        onSelect={() => navigate(projectPath(projectId, `/agents/${agent.id}`))}
        onStop={() => handleStop(agent.id)}
      />
      {(childrenByParentId.get(agent.id) ?? []).map((child) => (
        <AgentSidebarSubitem
          active={location.pathname === projectPath(projectId, `/agents/${child.id}`)}
          agent={child}
          key={child.id}
          onArchive={() => handleArchive(child.id)}
          onFail={() => handleFail(child.id)}
          onResume={() => handleResume(child.id)}
          onSelect={() => navigate(projectPath(projectId, `/agents/${child.id}`))}
          onStop={() => handleStop(child.id)}
        />
      ))}
    </Fragment>
  );

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar
            footer={
              <SidebarOption
                active={location.pathname === projectPath(projectId, '/agents/new')}
                icon="plus"
                label="New agent"
                onClick={() => navigate(projectPath(projectId, '/agents/new'))}
              />
            }
          >
            {activeAgents.length > 0 ? (
              <SidebarSection collapsible title="Active">
                {activeAgents.map(renderAgentBranch)}
              </SidebarSection>
            ) : null}
            {waitingAgents.length > 0 ? (
              <SidebarSection collapsible title="Waiting">
                {waitingAgents.map(renderAgentBranch)}
              </SidebarSection>
            ) : null}
            <SidebarSection collapsible title="Idle">
              {idleAgents.length === 0 ? (
                <AppBox variant="sidebar-empty">No idle agents.</AppBox>
              ) : (
                idleAgents.map(renderAgentBranch)
              )}
            </SidebarSection>
            {interruptedAgents.length > 0 ? (
              <SidebarSection collapsible title="Interrupted">
                {interruptedAgents.map(renderAgentBranch)}
              </SidebarSection>
            ) : null}
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}

function buildDirectChildrenByParentId(agents: AgentRecord[], topLevelAgents: AgentRecord[]) {
  const topLevelAgentIds = new Set(topLevelAgents.map((agent) => agent.id));
  const childrenByParentId = new Map<string, AgentRecord[]>();

  for (const agent of agents) {
    const parentAgentId = agent.parentAgentId;
    if (!parentAgentId || !topLevelAgentIds.has(parentAgentId)) {
      continue;
    }
    childrenByParentId.set(parentAgentId, [...(childrenByParentId.get(parentAgentId) ?? []), agent]);
  }

  return childrenByParentId;
}
