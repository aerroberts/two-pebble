import { ProviderLogo } from '@two-pebble/components';
import type { IntegrationProvider } from '@two-pebble/realtime';

type IntegrationProviderOption = {
  icon: JSX.Element;
  label: string;
  value: IntegrationProvider;
};

export const integrationProviderOptions: IntegrationProviderOption[] = [
  { icon: <ProviderLogo size="xs" provider="openai" />, label: 'OpenAI', value: 'openai' },
  { icon: <ProviderLogo size="xs" provider="openrouter" />, label: 'OpenRouter', value: 'openrouter' },
  { icon: <ProviderLogo size="xs" provider="anthropic" />, label: 'Anthropic', value: 'anthropic' },
  { icon: <ProviderLogo size="xs" provider="ollama" />, label: 'Ollama', value: 'ollama' },
  { icon: <ProviderLogo size="xs" provider="git" />, label: 'GitHub', value: 'github' },
];
