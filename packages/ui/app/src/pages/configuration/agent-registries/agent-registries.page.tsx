import { Header, PageLayout, Surface } from '@two-pebble/components';
import { AgentRegistriesList } from './agent-registries-list';
import { useAgentRegistriesPageState } from './use-agent-registries-page-state';

export function AgentRegistriesPage() {
  const state = useAgentRegistriesPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Registered agent templates. Pebble agents run inside the daemon with a chosen inference profile; framework agents wrap an external runtime like Claude Code or Codex.">
        Agents
      </Header>
      {state.createError.length > 0 ? <Surface>{state.createError}</Surface> : null}
      <AgentRegistriesList
        agentRegistries={state.agentRegistries}
        creating={state.creating}
        inferenceProfiles={state.inferenceProfiles}
        installs={state.installs}
        onCreateFramework={() => void state.createFrameworkRegistry()}
        onCreatePebble={() => void state.createPebbleRegistry()}
        onRegistryClick={(registryId) => state.navigate(`/configuration/agent-registries/${registryId}`)}
      />
    </PageLayout>
  );
}
