import type { AutomationIntervalUnit } from './automations.list';

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
  };
  response: {
    id: string;
  };
}
