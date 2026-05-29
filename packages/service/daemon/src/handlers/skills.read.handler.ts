import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadSkillOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readSkill'>;
type ReadSkillPayload = ReadSkillOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadSkillPayload) {
    return ctx.datastore.skills.read(payload);
  };
}
