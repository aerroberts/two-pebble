import type { AutomationIntervalUnit } from './automations.list';

/**
 * Defines the AutomationsUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationsUpdateOperation {
  name: 'updateAutomation';
  request: {
    agentRegistryId?: string;
    enabled?: boolean;
    id: string;
    intervalUnit?: AutomationIntervalUnit;
    intervalValue?: number;
    message?: string;
    name?: string;
    projectId?: string;
  };
  response: {
    id: string;
  };
}
