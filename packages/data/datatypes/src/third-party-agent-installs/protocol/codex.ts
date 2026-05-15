export interface ThirdPartyAgentInstall_Codex {
  frameworkId: 'codex';
  data: {
    /** Absolute path to the local `codex` executable detected on this install. */
    executablePath: string;
  };
}
