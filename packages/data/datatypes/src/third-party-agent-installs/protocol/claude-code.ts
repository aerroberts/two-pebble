export interface ThirdPartyAgentInstall_ClaudeCode {
  frameworkId: 'claude-code';
  data: {
    /** Absolute path to the local `claude` executable detected on this install. */
    executablePath: string;
  };
}
