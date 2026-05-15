import { Button, Header, PageLayout, Row, Section, Surface } from '@two-pebble/components';
import { AgentRegistriesList } from './agent-registries-list';
import { useAgentRegistriesPageState } from './use-agent-registries-page-state';

export function AgentRegistriesPage() {
  const state = useAgentRegistriesPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Registered agent templates. Pebble agents run inside the daemon with a chosen inference profile; framework agents wrap an external runtime like Claude Code or Codex.">
        Agents
      </Header>
      <Section
        actionItems={
          <Row gap="sm">
            <Button
              disabled={state.creating}
              leftIcon="plus"
              onClick={() => void state.createPebbleRegistry()}
              type="button"
              variant="secondary"
            >
              Add Pebble agent
            </Button>
            <Button
              disabled={state.creating}
              leftIcon="plus"
              onClick={() => void state.createFrameworkRegistry()}
              type="button"
            >
              Add framework agent
            </Button>
          </Row>
        }
        title="Agent registry"
      >
        {state.createError.length > 0 ? <Surface>{state.createError}</Surface> : null}
      </Section>
      <AgentRegistriesList
        agentRegistries={state.agentRegistries}
        inferenceProfiles={state.inferenceProfiles}
        installs={state.installs}
        onRegistryClick={(registryId) => state.navigate(`/configuration/agent-registries/${registryId}`)}
      />
    </PageLayout>
  );
}
