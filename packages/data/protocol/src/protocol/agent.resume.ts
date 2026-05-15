export interface AgentResumeOperation {
  name: 'resumeAgent';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
