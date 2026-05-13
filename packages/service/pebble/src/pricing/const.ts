import { PriceCalculator } from './price-calculator';
import { registerAnthropicPricing } from './provider-prices/anthropic';
import { registerBedrockPricing } from './provider-prices/bedrock';
import { registerOpenAIPricing } from './provider-prices/openai';
import { registerOpenRouterPricing } from './provider-prices/openrouter';
import { registerOpenRouterMultimodalPricing } from './provider-prices/openrouter-multimodal';

/**
 * Creates a calculator loaded with every built-in provider price table.
 * The returned instance can still be extended with caller-owned pricing.
 * Provider tables use the same model keys used by runtime provider IDs.
 */
export const calculator = new PriceCalculator();
registerAnthropicPricing(calculator);
registerBedrockPricing(calculator);
registerOpenAIPricing(calculator);
registerOpenRouterPricing(calculator);
registerOpenRouterMultimodalPricing(calculator);
