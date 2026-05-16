/**
 * Defines the ThirdPartyAgentInstallsDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsDeletedEvent {
  name: 'thirdPartyAgentInstallDeleted';
  payload: {
    id: string;
  };
}
