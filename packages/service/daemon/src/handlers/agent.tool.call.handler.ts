import { PebbleAgent } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CallAgentToolOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'callAgentTool'>;
type CallAgentToolPayload = CallAgentToolOperation['request'];
type CallAgentToolResponse = CallAgentToolOperation['response'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CallAgentToolPayload): Promise<CallAgentToolResponse> {
    const agent = ctx.agentRegistry.get(payload.agentId);
    if (!(agent instanceof PebbleAgent)) {
      throw new Error(`No active Pebble agent found: ${payload.agentId}`);
    }

    const result = await agent.invokeTool({
      id: crypto.randomUUID(),
      input: payload.input,
      type: 'cli',
      toolId: payload.toolId,
    });
    if (result === undefined) {
      throw new Error(`Tool "${payload.toolId}" did not return a CLI result.`);
    }

    return { result };
  };
}
