import type { AutomationIntervalUnit } from './automations.list';

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
