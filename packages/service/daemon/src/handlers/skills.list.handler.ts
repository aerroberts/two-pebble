import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListSkillsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listSkills'>;
type ListSkillsPayload = ListSkillsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListSkillsPayload) {
    return ctx.datastore.skills.list({
      limit: payload.limit ?? 200,
      offset: payload.offset ?? 0,
      projectId: payload.projectId,
    });
  };
}
