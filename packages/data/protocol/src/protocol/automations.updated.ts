import type { AutomationRecord } from './automations.list';

export interface AutomationUpdatedEvent {
  name: 'automationUpdated';
  payload: AutomationRecord;
}

export interface AutomationDeletedEvent {
  name: 'automationDeleted';
  payload: {
    id: string;
  };
}
