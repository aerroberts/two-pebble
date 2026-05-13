import { ListLayout } from '@two-pebble/components';
import type { IntegrationProvider } from '@two-pebble/realtime';
import { integrationProviderOptions } from './integration-provider-options';

interface IntegrationProviderPickerProps {
  creatingProvider: IntegrationProvider | null;
  onProviderSelected: (provider: IntegrationProvider) => void;
}

export function IntegrationProviderPicker(props: IntegrationProviderPickerProps) {
  return (
    <ListLayout
      items={integrationProviderOptions.map((option) => ({
        icon: option.icon,
        key: option.value,
        onClick: () => props.onProviderSelected(option.value),
        title: option.label,
        value: props.creatingProvider === option.value ? 'Creating...' : 'Create',
      }))}
    />
  );
}
