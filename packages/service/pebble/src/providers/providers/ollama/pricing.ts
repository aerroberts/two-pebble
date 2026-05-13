import { type ModelUsage, type PricingLineItem, staticPriceCalculator } from '../../../pricing';
import type { OllamaChatResponse } from './types';

interface OllamaPriceLineItemsInput {
  data: OllamaChatResponse;
  modelId: string;
}

export function buildOllamaPriceLineItems(input: OllamaPriceLineItemsInput): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage('ollama', input.modelId, readOllamaUsage(input.data));
}

function readOllamaUsage(data: OllamaChatResponse): ModelUsage | undefined {
  if (data.prompt_eval_count === undefined && data.eval_count === undefined) {
    return undefined;
  }

  return {
    inputTokensReadUncached: data.prompt_eval_count ?? 0,
    outputTokensGenerated: data.eval_count ?? 0,
  };
}
