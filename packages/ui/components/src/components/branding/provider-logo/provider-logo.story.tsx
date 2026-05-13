import type { Meta, StoryObj } from '@storybook/react';

import { ProviderLogo } from './provider-logo';

const meta: Meta<typeof ProviderLogo> = {
  title: 'Branding/ProviderLogo',
  component: ProviderLogo,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof ProviderLogo>;

const providers = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'openrouter', label: 'OpenRouter' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'ollama', label: 'Ollama' },
] as const;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-background p-8">
      <div className="flex w-full items-center gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center gap-3 rounded-sm bg-surface px-4 py-3">
            <ProviderLogo provider={provider.id} size="lg" />
            <span className="text-sm font-medium text-content">{provider.label}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
