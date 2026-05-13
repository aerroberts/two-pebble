import type { ModelUsage } from './types';

export function isEmptyUsage(usage: ModelUsage): boolean {
  return (
    usage.inputTokensReadUncached === undefined &&
    usage.inputTokensReadCached === undefined &&
    usage.inputTokensWriteCached === undefined &&
    usage.outputTokensGenerated === undefined &&
    usage.outputTokensThinking === undefined
  );
}
