export interface AgentMessageOperation {
  name: 'sendAgentMessage';
  request: {
    /** ID of the running agent that should receive the follow-up message. */
    agentId: string;
    /** Plain-text message body. The daemon wraps it as a single Cell.text. */
    message: string;
  };
  response: {
    id: string;
  };
}
