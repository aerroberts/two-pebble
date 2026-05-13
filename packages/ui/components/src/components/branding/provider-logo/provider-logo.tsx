export type ProviderLogoProvider = 'anthropic' | 'ollama' | 'openai' | 'openrouter' | string;

export type ProviderLogoSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProviderLogoProps {
  provider: ProviderLogoProvider;
  size?: ProviderLogoSize;
}

const providerLogoUrls: Record<string, string> = {
  anthropic: new URL('./anthropic.png', import.meta.url).href,
  'claude-code': new URL('./claude.png', import.meta.url).href,
  ollama: new URL('./ollama.png', import.meta.url).href,
  openai: new URL('./openai.png', import.meta.url).href,
  openrouter: new URL('./open-router.png', import.meta.url).href,
  git: new URL('./git.png', import.meta.url).href,
};

const providerLogoLabels: Record<string, string> = {
  anthropic: 'Anthropic',
  'claude-code': 'Claude Code',
  ollama: 'Ollama',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  git: 'Git',
};

const sizeClasses: Record<ProviderLogoSize, string> = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
};

export function ProviderLogo(props: ProviderLogoProps) {
  const src = providerLogoUrls[props.provider];

  if (src === undefined) {
    return null;
  }

  const sizeClass = sizeClasses[props.size ?? 'md'];

  return (
    <img
      alt={`${providerLogoLabels[props.provider] ?? props.provider} logo`}
      className={`shrink-0 rounded-md object-contain ${sizeClass}`}
      src={src}
    />
  );
}

export function AnthropicLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="anthropic" size={props.size} />;
}

export function OpenAiLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="openai" size={props.size} />;
}

export function OpenRouterLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="openrouter" size={props.size} />;
}

export function OllamaLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="ollama" size={props.size} />;
}

export function GitLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="git" size={props.size} />;
}

export function ClaudeCodeLogo(props: Omit<ProviderLogoProps, 'provider'>) {
  return <ProviderLogo provider="claude-code" size={props.size} />;
}
