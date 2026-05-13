export interface ThirdPartyAgentInstallsDeletedEvent {
  name: 'thirdPartyAgentInstallDeleted';
  payload: {
    id: string;
  };
}
