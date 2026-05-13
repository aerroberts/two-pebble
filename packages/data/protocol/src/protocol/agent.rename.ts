export interface AgentRenameOperation {
  name: 'renameAgent';
  request: {
    id: string;
    name: string;
  };
  response: {
    id: string;
  };
}
