import { Header, PageLayout } from '@two-pebble/components';
import { AgentsLaunchSection } from './agents-launch-section';
import { useAgentsPageState } from './use-agents-page-state';

export function AgentsPage() {
  const state = useAgentsPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Configure and launch a new daemon-owned Pebble agent.">New agent</Header>
      <AgentsLaunchSection
        agentRegistriesLoading={state.agentRegistries.status === 'loading'}
        agentRegistryId={state.agentRegistryId}
        agentRegistryOptions={state.agentRegistryOptions}
        quickActionAgents={state.quickActionAgents}
        launching={state.launching}
        onAgentRegistryIdChange={state.setAgentRegistryId}
        onLaunchAgent={(payload) => void state.launchSelectedAgent(payload)}
        onLaunchQuickAction={(registryId) => void state.launchQuickActionAgent(registryId)}
      />
    </PageLayout>
  );
}
