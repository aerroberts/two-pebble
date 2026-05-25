import type { ChildLifecycle, ChildRecord } from './sub-agent-types';

export function childStatusLine(child: ChildRecord): string {
  return `${child.name} (${child.mode}, ${child.agentId}) - ${LIFECYCLE_DESCRIPTIONS[child.lifecycle]}`;
}

const LIFECYCLE_DESCRIPTIONS: Record<ChildLifecycle, string> = {
  completed: 'completed',
  failed: 'failed',
  killed: 'stopped',
  running: 'running',
  'waiting-for-parent': 'waiting for parent follow-up',
};
