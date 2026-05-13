import type { AgentTraceItemProps } from '../agent-trace-item';

export type ToolTraceSource = 'cli' | 'framework' | 'native' | 'provider-native' | string | undefined;

export function toolTraceIcon(source: ToolTraceSource): AgentTraceItemProps['icon'] {
  if (source === 'cli') {
    return 'Braces';
  }

  if (source === 'native') {
    return 'Plug';
  }

  if (source === 'framework' || source === 'provider-native') {
    return 'Bot';
  }

  return 'Wrench';
}
