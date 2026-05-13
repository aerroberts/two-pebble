import { AgentTrace } from './agent-trace';
import type { AgentTraceRecord } from './types';

export const traceBaseTime = Date.now();

export function renderTraceStory(trace: AgentTraceRecord) {
  return (
    <div className="min-h-screen w-full bg-background p-6">
      <AgentTrace traces={[trace]} />
    </div>
  );
}
