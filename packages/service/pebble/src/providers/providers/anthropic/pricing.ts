import { type ModelUsage, type PricingLineItem, staticPriceCalculator } from '../../../pricing';
import type { AnthropicMessageResponse } from './types';

interface AnthropicPriceLineItemsInput {
  data: AnthropicMessageResponse;
  modelId: string;
}

export function buildAnthropicPriceLineItems(input: AnthropicPriceLineItemsInput): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage('anthropic', input.modelId, readAnthropicUsage(input.data));
}

function readAnthropicUsage(data: AnthropicMessageResponse): ModelUsage | undefined {
  if (data.usage === undefined) {
    return undefined;
  }

  return {
    inputTokensReadCached: data.usage.cache_read_input_tokens ?? 0,
    inputTokensReadUncached: data.usage.input_tokens,
    inputTokensWriteCached: data.usage.cache_creation_input_tokens ?? 0,
    outputTokensGenerated: data.usage.output_tokens,
  };
}
