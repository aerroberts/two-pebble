import { Button, Header, PageLayout, Surface } from '@two-pebble/components';
import { IntegrationProviderPicker } from './integration-provider-picker';
import { IntegrationsList } from './integrations-list';
import { useIntegrationsPageState } from './use-integrations-page-state';

export function IntegrationsPage() {
  const state = useIntegrationsPageState();

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          state.selectingProvider ? null : (
            <Button leftIcon="plus" onClick={() => state.setSelectingProvider(true)} type="button">
              Create integration
            </Button>
          )
        }
        subtitle="Connect to model providers like Anthropic, OpenAI, or OpenRouter so agents can authenticate and bill against your accounts."
      >
        Integrations
      </Header>
      {state.selectingProvider ? (
        <IntegrationProviderPicker
          creatingProvider={state.creatingProvider}
          onProviderSelected={(provider) => void state.createIntegrationForProvider(provider)}
        />
      ) : null}
      {state.createError.length > 0 ? <Surface>{state.createError}</Surface> : null}
      <IntegrationsList
        integrations={state.integrations}
        onIntegrationClick={(integrationId) => state.navigate(`/configuration/integrations/${integrationId}`)}
      />
    </PageLayout>
  );
}
