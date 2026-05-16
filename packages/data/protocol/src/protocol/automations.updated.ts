import type { AutomationRecord } from './automations.list';

/**
 * Defines the AutomationUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationUpdatedEvent {
  name: 'automationUpdated';
  payload: AutomationRecord;
}

/**
 * Defines the AutomationDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationDeletedEvent {
  name: 'automationDeleted';
  payload: {
    id: string;
  };
}
