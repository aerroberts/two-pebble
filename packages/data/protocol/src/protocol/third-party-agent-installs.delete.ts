/**
 * Defines the ThirdPartyAgentInstallsDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsDeleteOperation {
  name: 'deleteThirdPartyAgentInstall';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
