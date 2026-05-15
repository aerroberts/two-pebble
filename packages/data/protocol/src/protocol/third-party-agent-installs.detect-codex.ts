/**
 * Probes the local machine for an installed `codex` executable and creates
 * a third-party agent install row on success. The daemon resolves the
 * absolute path (via `which codex` / equivalent) and stores it on the
 * install so later launches can spawn the binary without re-checking.
 */
export interface ThirdPartyAgentInstallsDetectCodexOperation {
  name: 'detectCodexInstall';
  request: Record<string, never>;
  response: {
    detected: boolean;
    executablePath: string;
    installId: string;
  };
}
