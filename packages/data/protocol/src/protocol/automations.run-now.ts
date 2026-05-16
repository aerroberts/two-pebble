/**
 * Defines the AutomationsRunNowOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AutomationsRunNowOperation {
  name: 'runAutomationNow';
  request: {
    id: string;
  };
  response: {
    agentId: string;
  };
}
