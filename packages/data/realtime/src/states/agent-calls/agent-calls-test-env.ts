import { useAgentCalls, useReadAgentCall } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { agentCreateInput, modelCallRecordInput } from '../../testing/support/test-inputs';

export async function buildAgentCallHydrationTestEnv() {
  const ctx = await buildRealtimeContext({});
  const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
  const created = await ctx.daemon.backfill('recordAgentCall', modelCallRecordInput(agent.id));
  const hook = await ctx.realtime.renderHook(() => [useAgentCalls({ agentId: agent.id }), useReadAgentCall()] as const);

  return { created, ctx, hook };
}
