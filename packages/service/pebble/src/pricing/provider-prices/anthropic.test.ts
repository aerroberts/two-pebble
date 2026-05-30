import { describe, expect, it, spyOn } from 'bun:test';
import { PriceCalculator } from '../price-calculator';
import { registerAnthropicPricing } from './anthropic';

describe('anthropic pricing', () => {
  it('registers Claude Opus 4.8 pricing', () => {
    const calculator = new PriceCalculator();
    registerAnthropicPricing(calculator);
    const warn = spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const result = calculator.calculate('anthropic/claude-opus-4-8', {
        inputTokensReadUncached: 10,
        inputTokensReadCached: 2,
        inputTokensWriteCached: 3,
        outputTokensGenerated: 4,
      });

      expect(warn).not.toHaveBeenCalled();
      expect(result.lineItems.map(({ timestamp: _timestamp, total: _total, ...item }) => item)).toEqual([
        {
          provider: 'anthropic',
          modelId: 'claude-opus-4-8',
          charge: 'input-tokens-read-uncached',
          quantity: 10,
          price: 0.000005,
        },
        {
          provider: 'anthropic',
          modelId: 'claude-opus-4-8',
          charge: 'input-tokens-read-cached',
          quantity: 2,
          price: 5e-7,
        },
        {
          provider: 'anthropic',
          modelId: 'claude-opus-4-8',
          charge: 'input-tokens-write-cached',
          quantity: 3,
          price: 0.00000625,
        },
        {
          provider: 'anthropic',
          modelId: 'claude-opus-4-8',
          charge: 'output-tokens-generated',
          quantity: 4,
          price: 0.000025,
        },
      ]);
      expect(result.lineItems.map((item) => item.total)).toEqual([
        0.00005,
        0.000001,
        expect.closeTo(0.00001875),
        0.0001,
      ]);
    } finally {
      warn.mockRestore();
    }
  });
});
