import { Header, ListLayout, PageLayout } from '@two-pebble/components';
import { type AgentRecord, useAgents } from '@two-pebble/realtime';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export function DeveloperArchivedAgentsPage() {
  const agents = useAgents();
  const navigate = useNavigate();
  const archivedAgents = useMemo(
    () =>
      agents
        .values()
        .filter(isTerminal)
        .sort((left, right) => right.startedAt - left.startedAt),
    [agents],
  );

  return (
    <PageLayout width="fixed">
      <Header subtitle="Agents that have completed, failed, or gone offline.">Archived agents</Header>
      <ListLayout
        emptyState={agents.status === 'loading' ? 'Loading agents.' : 'No archived agents.'}
        items={archivedAgents.map((agent) => ({
          icon: agent.status === 'failed' ? 'circle-x' : 'circle-check',
          key: agent.id,
          onClick: () => navigate(`/agents/${agent.id}`),
          subtitle: agent.status,
          title: agent.name.length > 0 ? agent.name : agent.id,
        }))}
      />
    </PageLayout>
  );
}

function isTerminal(agent: AgentRecord): boolean {
  return agent.status === 'failed' || agent.status === 'offline';
}
