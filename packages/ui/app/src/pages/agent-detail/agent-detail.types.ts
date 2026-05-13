export type AgentDetailViewMode = 'chat' | 'trace' | 'price' | 'waterfall';

export const AGENT_DETAIL_VIEW_OPTIONS = [
  { value: 'chat', label: 'Chat', icon: 'message-square' },
  { value: 'trace', label: 'Trace', icon: 'activity' },
  { value: 'price', label: 'Price', icon: 'dollar-sign' },
  { value: 'waterfall', label: 'Waterfall', icon: 'list-tree' },
];

export function parseAgentDetailViewMode(value: string): AgentDetailViewMode {
  if (value === 'trace' || value === 'price' || value === 'waterfall') {
    return value;
  }

  return 'chat';
}
