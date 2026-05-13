import { LoadableRegistry } from '../../loadable';
import type { IntegrationRecord, IntegrationsState } from './types';

export function createIntegrationsState(): IntegrationsState {
  return {
    integrations: new LoadableRegistry<IntegrationRecord>(),
  };
}
