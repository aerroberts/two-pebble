export type AutomationIntervalUnit = 'manual' | 'minutes' | 'hours' | 'days';

export interface AutomationRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  agentRegistryId: string;
  message: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  lastRanAt: number | null;
  enabled: boolean;
}

export interface AutomationsListOperation {
  name: 'listAutomations';
  request: {
    limit: number;
    offset: number;
  };
  response: {
    items: AutomationRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
