import { Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { IntegrationSettingsContent } from './integration-settings-content';
import { useIntegrationSettingsPageState } from './use-integration-settings-page-state';

export function IntegrationSettingsPage() {
  const state = useIntegrationSettingsPageState();

  if (state.redirectToIntegrations) {
    return <Navigate to="/configuration/integrations" replace />;
  }

  if (state.integration === null || state.integration.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Integrations</Header>
        <Section title="Connection">
          <Surface>Loading integration.</Surface>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout width="fixed">
      <Header>Integrations</Header>
      <IntegrationSettingsContent
        apiKey={state.apiKey}
        baseUrl={state.baseUrl}
        integration={state.integration.value}
        name={state.name}
        onApiKeyBlur={state.updateApiKeyProvider}
        onApiKeyChange={state.setApiKey}
        onBaseUrlBlur={state.updateOllama}
        onBaseUrlChange={state.setBaseUrl}
        onDeleteClick={state.deleteSelectedIntegration}
        onNameBlur={state.updateName}
        onNameChange={state.setName}
      />
    </PageLayout>
  );
}
