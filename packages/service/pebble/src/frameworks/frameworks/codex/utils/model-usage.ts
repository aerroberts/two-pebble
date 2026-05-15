import type { Usage as CodexSdkUsage } from '@openai/codex-sdk';
import type { ModelUsage as PebbleModelUsage } from '../../../../pricing';

const DEFAULT_CODEX_MODEL_ID = 'gpt-5-codex';

/**
 * Picks the model id Pebble should price the turn under. The Codex SDK does
 * not report the served model name on the usage event, so callers either
 * pass the value they configured on the thread or rely on the SDK default.
 */
export function normalizeCodexModelId(modelId: string | undefined): string {
  if (modelId === undefined || modelId.length === 0) {
    return DEFAULT_CODEX_MODEL_ID;
  }
  if (modelId.startsWith('openai/')) {
    return modelId.substring('openai/'.length);
  }
  return modelId;
}

/**
 * Maps the Codex SDK's per-turn usage shape into the Pebble usage shape
 * consumed by the static price calculator. Codex reports cached input
 * separately; uncached input is the difference between total and cached.
 */
export function sdkUsageToPebbleUsage(usage: CodexSdkUsage): PebbleModelUsage {
  const cached = usage.cached_input_tokens;
  const total = usage.input_tokens;
  const uncached = total >= cached ? total - cached : total;
  return {
    inputTokensReadUncached: uncached,
    inputTokensReadCached: cached,
    outputTokensGenerated: usage.output_tokens,
    outputTokensThinking: usage.reasoning_output_tokens,
  };
}
