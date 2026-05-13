import { ListLayout, ProviderLogo, Status } from '@two-pebble/components';
import type { IntegrationRecord, LoadableRegistry } from '@two-pebble/realtime';
import { getIntegrationStatus } from './integration-status';

interface IntegrationsListProps {
  integrations: LoadableRegistry<IntegrationRecord>;
  onIntegrationClick: (integrationId: string) => void;
}

export function IntegrationsList(props: IntegrationsListProps) {
  const aiIntegrations = props.integrations.entries();

  return (
    <ListLayout
      emptyState={props.integrations.status === 'loading' ? 'Loading integrations.' : 'No integrations created.'}
      items={aiIntegrations.map((integration) => ({
        icon: <ProviderLogo size="xs" provider={integration.value.provider} />,
        key: integration.id,
        onClick: () => props.onIntegrationClick(integration.id),
        subtitle: integration.value.provider,
        title: integration.value.name.length > 0 ? integration.value.name : 'Untitled integration',
        value: (
          <Status state={getIntegrationStatus(integration.value)} label={getIntegrationStatus(integration.value)} />
        ),
      }))}
    />
  );
}
