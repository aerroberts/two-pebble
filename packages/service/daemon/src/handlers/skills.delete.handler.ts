import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteSkillOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteSkill'>;
type DeleteSkillPayload = DeleteSkillOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteSkillPayload) {
    const deleted = await ctx.datastore.skills.delete(payload);

    ctx.events.emit('skillDeleted', deleted);

    return deleted;
  };
}
