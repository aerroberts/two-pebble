import type { ModelUsage, PricingLineItem, StaticPricing } from './types';
import { isEmptyUsage } from './model-usage-guards';

/**
 * Static price calculator for registered model pricing.
 * Register model pricing with "provider/modelId" keys.
 * Models can have multiple pricing tiers based on input token count.
 */
export class PriceCalculator {
  private readonly staticPricing = new Map<string, StaticPricing[]>();

  /**
   * Registers a pricing tier for a model key.
   * Multiple registrations for the same key are treated as ordered tiers.
   * Tier selection is based on the highest matching input token threshold.
   */
  public registerPricing(modelId: string, pricing: StaticPricing) {
    const existing = this.staticPricing.get(modelId) ?? [];
    existing.push(pricing);
    this.staticPricing.set(modelId, existing);
  }

  /**
   * Resolves billable line items for a usage payload addressed by
   * `provider/modelId`. Empty or missing usage returns an empty list so
   * callers never need a redundant guard. Used by every provider
   * adapter to translate upstream usage into pricing line items.
   */
  public lineItemsForUsage(provider: string, modelId: string, usage: ModelUsage | undefined): PricingLineItem[] {
    if (usage === undefined || isEmptyUsage(usage)) return [];
    return this.calculate(`${provider}/${modelId}`, usage).lineItems;
  }

  /**
   * Computes a cost breakdown for a model and usage payload.
   * Unknown models return an empty line item list with a zero total.
   * Line items carry structured provider, model, variant, and charge fields
   * so downstream consumers can group and chart usage without parsing names.
   */
  public calculate(modelId: string, usage: ModelUsage) {
    const staticPricing = this.getStaticPricingForTier(modelId, usage);

    if (!staticPricing) {
      console.warn(`No pricing registered for model: ${modelId}. Cost tracking will be unavailable.`);
      return { modelId, totalCost: 0, lineItems: [] };
    }

    const [provider, ...modelParts] = modelId.split('/');
    const model = modelParts.join('/');
    const variant = staticPricing.inputTokensTier === undefined ? undefined : `tier-${staticPricing.inputTokensTier}`;
    const timestamp = Date.now();
    const lineItems: PricingLineItem[] = [];

    const push = (charge: string, quantity: number, ppm: number) => {
      lineItems.push({
        provider: provider ?? '',
        modelId: model,
        ...(variant === undefined ? {} : { modelVariantId: variant }),
        charge,
        quantity,
        price: ppm / 1_000_000,
        timestamp,
        total: quantity * (ppm / 1_000_000),
      });
    };

    if (staticPricing.inputTokensReadUncachedPPM && usage.inputTokensReadUncached) {
      push('input-tokens-read-uncached', usage.inputTokensReadUncached, staticPricing.inputTokensReadUncachedPPM);
    }
    if (staticPricing.inputTokensReadCachedPPM && usage.inputTokensReadCached) {
      push('input-tokens-read-cached', usage.inputTokensReadCached, staticPricing.inputTokensReadCachedPPM);
    }
    if (staticPricing.inputTokensWriteCachedPPM && usage.inputTokensWriteCached) {
      push('input-tokens-write-cached', usage.inputTokensWriteCached, staticPricing.inputTokensWriteCachedPPM);
    }
    if (staticPricing.outputTokensGeneratedPPM && usage.outputTokensGenerated) {
      push('output-tokens-generated', usage.outputTokensGenerated, staticPricing.outputTokensGeneratedPPM);
    }
    if (staticPricing.outputTokensGeneratedPPM && usage.outputTokensThinking) {
      push('thinking-tokens-generated', usage.outputTokensThinking, staticPricing.outputTokensGeneratedPPM);
    }

    return {
      modelId,
      totalCost: lineItems.reduce((sum, item) => sum + item.total, 0),
      lineItems,
    };
  }

  private getStaticPricingForTier(modelId: string, usage: ModelUsage) {
    const totalInputTokens =
      (usage.inputTokensReadUncached ?? 0) + (usage.inputTokensReadCached ?? 0) + (usage.inputTokensWriteCached ?? 0);
    const pricingTiers = this.staticPricing.get(modelId);
    if (pricingTiers && pricingTiers.length > 0) {
      // Find the tier with the highest inputTokensTier that's <= totalInputTokens
      // Tiers without inputTokensTier (undefined or 0) are treated as the base tier
      let selectedTier: StaticPricing | undefined;
      for (const tier of pricingTiers) {
        const tierThreshold = tier.inputTokensTier ?? 0;
        if (tierThreshold <= totalInputTokens) {
          if (!selectedTier || tierThreshold > (selectedTier.inputTokensTier ?? 0)) {
            selectedTier = tier;
          }
        }
      }

      if (selectedTier) {
        return selectedTier;
      }
    }

    return undefined;
  }

  private listProviders() {
    const allProviders = new Set<string>();
    for (const key of this.staticPricing.keys()) {
      const provider = key.split('/')[0];
      if (provider !== undefined) {
        allProviders.add(provider);
      }
    }
    return Array.from(allProviders);
  }

  /**
   * Returns true when a provider has any registered model keys.
   * Callers can use this to distinguish unsupported providers from
   * unsupported model names within an otherwise known provider.
   */
  public knowsProvider(provider: string) {
    return this.listProviders().includes(provider);
  }

  /**
   * Lists model IDs registered under a provider prefix.
   * Returned values remove the provider prefix and preserve model names.
   * This is mainly used for provider diagnostics and fallback logging.
   */
  public listModels(provider: string) {
    const allModels = new Set<string>();
    for (const key of this.staticPricing.keys()) {
      if (key.startsWith(`${provider}/`)) {
        allModels.add(key.substring(provider.length + 1));
      }
    }
    return Array.from(allModels);
  }
}
