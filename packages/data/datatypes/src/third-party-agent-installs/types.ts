import type { ThirdPartyAgentInstall_ClaudeCode } from './protocol/claude-code';
import type { ThirdPartyAgentInstall_Codex } from './protocol/codex';

export type { ThirdPartyAgentInstall_ClaudeCode, ThirdPartyAgentInstall_Codex };

export type ThirdPartyAgentInstall = ThirdPartyAgentInstall_ClaudeCode | ThirdPartyAgentInstall_Codex;

export type ThirdPartyAgentFrameworkId = ThirdPartyAgentInstall['frameworkId'];
