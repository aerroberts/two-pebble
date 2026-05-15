export interface AutomationsRunNowOperation {
  name: 'runAutomationNow';
  request: {
    id: string;
  };
  response: {
    agentId: string;
  };
}
