/**
 * Probes the local machine for an installed `claude` executable and creates
 * a third-party agent install row on success. The daemon resolves the
 * absolute path (via `which claude` / equivalent) and stores it on the
 * install so later launches can spawn the binary without re-checking.
 */
export interface ThirdPartyAgentInstallsDetectClaudeCodeOperation {
  name: 'detectClaudeCodeInstall';
  request: Record<string, never>;
  response: {
    detected: boolean;
    executablePath: string;
    installId: string;
  };
}
