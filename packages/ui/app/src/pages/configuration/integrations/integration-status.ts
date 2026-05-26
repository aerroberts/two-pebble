import type { StatusState } from '@two-pebble/components';
import type { IntegrationRecord } from '@two-pebble/realtime';

export function getIntegrationStatus(integration: IntegrationRecord): StatusState {
  switch (integration.provider) {
    case 'anthropic':
    case 'openai':
    case 'openrouter':
      return integration.data.apiKey.length > 0 ? 'connected' : 'disconnected';
    case 'github':
      return integration.data.token.length > 0 ? 'connected' : 'disconnected';
    case 'ollama':
      return integration.data.baseUrl.length > 0 ? 'connected' : 'disconnected';
  }
}
