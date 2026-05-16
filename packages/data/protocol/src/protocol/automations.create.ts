import type { AutomationIntervalUnit } from './automations.list';

/**
 * Defines the AutomationsCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationsCreateOperation {
  name: 'createAutomation';
  request: {
    agentRegistryId: string;
    enabled: boolean;
    intervalUnit: AutomationIntervalUnit;
    intervalValue: number;
    message: string;
    name: string;
  };
  response: {
    id: string;
  };
}
