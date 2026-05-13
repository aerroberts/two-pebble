import { Header, IconButton, Input, InputArea, PageLayout, Section, Select, Surface } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { CapabilitiesSection } from './capabilities/capabilities-section';
import { SubAgentsSection } from './sub-agents/sub-agents-section';
import { useAgentRegistrySettingsPageState } from './use-agent-registry-settings-page-state';
import { WorkspaceConfigSection } from './workspace-config-section';

export function AgentRegistrySettingsPage() {
  const state = useAgentRegistrySettingsPageState();

  if (state.redirectToRegistries) {
    return <Navigate replace to="/configuration/agent-registries" />;
  }

  if (state.registry === null || state.registry.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Agents</Header>
        <Section title="Agent">
          <Surface>Loading agent.</Surface>
        </Section>
      </PageLayout>
    );
  }

  const isFramework = state.registryKind === 'framework';

  return (
    <PageLayout width="fixed">
      <Header>Agents</Header>
      <Section
        actionItems={
          <IconButton aria-label="Delete agent" icon="trash-2" onClick={state.deleteSelectedRegistry} type="button" />
        }
        subtitle={isFramework ? 'Framework agent' : 'Pebble agent'}
        title="Configure"
      >
        <Surface>
          <Input
            label="Name"
            onBlur={state.updateName}
            onChange={(event) => state.setName(event.target.value)}
            value={state.name}
          />
          {isFramework ? (
            <Select
              fullWidth
              label="Third-party agent install"
              onChange={state.updateThirdPartyAgentInstallId}
              options={state.installOptions}
              placeholder="Select install"
              value={state.thirdPartyAgentInstallId}
            />
          ) : (
            <Select
              fullWidth
              label="Inference profile"
              onChange={state.updateInferenceProfileId}
              options={state.inferenceProfileOptions}
              placeholder="Select inference profile"
              value={state.inferenceProfileId}
            />
          )}
          <InputArea
            label="System prompt"
            onBlur={state.updateSystemPrompt}
            onChange={(event) => state.setSystemPrompt(event.target.value)}
            value={state.systemPrompt}
          />
        </Surface>
      </Section>
      <WorkspaceConfigSection
        allowNone={!isFramework}
        config={state.workspaceConfig}
        onFixedPathChange={state.updateWorkspaceFixedPath}
        onKindChange={state.updateWorkspaceConfigKind}
        onRepositoryChange={state.updateWorkspaceRepositoryId}
        repositories={state.repositories}
      />
      {isFramework ? null : (
        <>
          <CapabilitiesSection
            attachedSpecs={state.capabilitySpecs}
            onRemoveCapability={state.removeCapability}
            onSetCapabilityConfig={state.setCapabilityConfig}
          />
          <SubAgentsSection
            onChange={state.setSubAgentReferences}
            references={state.subAgentReferences}
            registryOptions={state.otherRegistryOptions}
          />
        </>
      )}
    </PageLayout>
  );
}
