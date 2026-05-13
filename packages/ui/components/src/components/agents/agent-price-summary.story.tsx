import type { Meta, StoryObj } from '@storybook/react';
import type { AgentPriceSummaryLineItem } from './agent-price-summary';
import { AgentPriceSummary } from './agent-price-summary';

const meta: Meta<typeof AgentPriceSummary> = {
  title: 'Agents/Price Summary',
  component: AgentPriceSummary,
};

export default meta;
type Story = StoryObj<typeof AgentPriceSummary>;

const base = Date.now();

const lineItems: AgentPriceSummaryLineItem[] = [
  {
    id: 'line-1',
    provider: 'anthropic',
    modelId: 'claude-opus-4-7',
    charge: 'input-tokens-read-uncached',
    price: 0.000005,
    quantity: 24000,
    timestamp: base,
    total: 0.12,
  },
  {
    id: 'line-2',
    provider: 'anthropic',
    modelId: 'claude-opus-4-7',
    charge: 'input-tokens-read-cached',
    price: 0.0000005,
    quantity: 18000,
    timestamp: base + 2200,
    total: 0.009,
  },
  {
    id: 'line-3',
    provider: 'anthropic',
    modelId: 'claude-opus-4-7',
    charge: 'output-tokens-generated',
    price: 0.000025,
    quantity: 4200,
    timestamp: base + 3800,
    total: 0.105,
  },
  {
    id: 'line-4',
    provider: 'openai',
    modelId: 'gpt-5.4-mini',
    charge: 'output-tokens-generated',
    price: 0.000002,
    quantity: 3600,
    timestamp: base + 5400,
    total: 0.0072,
  },
];

export const Default: Story = {
  args: {
    chartMode: 'price',
    lineItems,
  },
};
