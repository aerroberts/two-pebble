/**
 * Defines the AgentResumeOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentResumeOperation {
  name: 'resumeAgent';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
