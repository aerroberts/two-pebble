/**
 * Defines the AutomationIntervalUnit protocol alias shared across daemon bridge messages.
 * Keep this exported type explicit so consumers can rely on the wire shape.
 */
export type AutomationIntervalUnit = 'manual' | 'minutes' | 'hours' | 'days';

/**
 * Defines the AutomationRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  agentRegistryId: string;
  projectId: string | null;
  message: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  lastRanAt: number | null;
  enabled: boolean;
}

/**
 * Defines the AutomationsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
