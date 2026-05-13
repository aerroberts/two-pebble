import type { ModelUsage as ClaudeCodeSdkModelUsage } from '@anthropic-ai/claude-agent-sdk';
import type { ModelUsage as PebbleModelUsage } from '../../../../pricing';

/**
 * Strips ANSI/terminal style suffixes and the `anthropic/` provider prefix
 * from a model id reported by the Claude Code SDK. The SDK occasionally
 * emits styled keys; Pebble pricing keys are always provider-less.
 */
export function normalizeClaudeCodeModelId(modelId: string): string {
  const ansiStylePattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
  const plain = modelId.replace(ansiStylePattern, '').replace(/\[[0-9;]*m\]$/g, '');
  if (plain.startsWith('anthropic/')) {
    return plain.substring('anthropic/'.length);
  }
  return plain;
}

/**
 * Maps the Claude Code SDK's per-model usage shape into the Pebble usage
 * shape consumed by the static price calculator.
 */
export function sdkUsageToPebbleUsage(usage: ClaudeCodeSdkModelUsage): PebbleModelUsage {
  return {
    inputTokensReadUncached: usage.inputTokens,
    inputTokensReadCached: usage.cacheReadInputTokens,
    inputTokensWriteCached: usage.cacheCreationInputTokens,
    outputTokensGenerated: usage.outputTokens,
  };
}
