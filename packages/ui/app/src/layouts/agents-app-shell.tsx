import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { type AgentRecord, useAgents, useCompleteAgent, useStopAgent } from '@two-pebble/realtime';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgentSidebarItem } from './agent-sidebar-item';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

type SidebarAgentStatus = AgentRecord['status'];

export function AgentsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const agents = useAgents();
  const stopAgent = useStopAgent();
  const completeAgent = useCompleteAgent();
  const agentList = agents.values().sort((left, right) => right.startedAt - left.startedAt);
  const activeAgents = agentList.filter((agent) => agent.status === 'running');
  const idleAgents = agentList.filter((agent) => agent.status === 'idle');
  const archivedAgents = agentList.filter((agent) => isTerminal(agent.status));

  const handleStop = (agentId: string) => {
    void stopAgent({ agentId, reason: 'user stop from sidebar' }).catch(() => undefined);
  };

  const handleArchive = (agentId: string) => {
    void completeAgent({ id: agentId }).catch(() => undefined);
  };

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar tone="auxiliary">
            <SidebarOption
              active={location.pathname === '/agents/new'}
              icon="plus"
              label="New agent"
              onClick={() => navigate('/agents/new')}
            />
            {activeAgents.length > 0 ? (
              <SidebarSection collapsible title="Active">
                {activeAgents.map((agent) => (
                  <AgentSidebarItem
                    active={location.pathname === `/agents/${agent.id}`}
                    agent={agent}
                    key={agent.id}
                    onSelect={() => navigate(`/agents/${agent.id}`)}
                    onStop={() => handleStop(agent.id)}
                  />
                ))}
              </SidebarSection>
            ) : null}
            <SidebarSection collapsible title="Idle">
              {idleAgents.length === 0 ? (
                <AppBox variant="sidebar-empty">No idle agents.</AppBox>
              ) : (
                idleAgents.map((agent) => (
                  <AgentSidebarItem
                    active={location.pathname === `/agents/${agent.id}`}
                    agent={agent}
                    key={agent.id}
                    onArchive={() => handleArchive(agent.id)}
                    onSelect={() => navigate(`/agents/${agent.id}`)}
                  />
                ))
              )}
            </SidebarSection>
            {archivedAgents.length > 0 ? (
              <SidebarSection collapsible defaultCollapsed title="Archived">
                {archivedAgents.map((agent) => (
                  <AgentSidebarItem
                    active={location.pathname === `/agents/${agent.id}`}
                    agent={agent}
                    key={agent.id}
                    onSelect={() => navigate(`/agents/${agent.id}`)}
                  />
                ))}
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

function isTerminal(status: SidebarAgentStatus): boolean {
  return status === 'failed';
}
