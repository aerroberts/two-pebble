import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { validateSkillFolder } from '../skills/skill-folder';
import type { DaemonHandlerContext } from '../types';

type CreateSkillOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createSkill'>;
type CreateSkillPayload = CreateSkillOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateSkillPayload) {
    // Fail fast: the folder must exist before we persist a record pointing
    // at it. This is the only place create touches disk.
    const diskFolderPath = validateSkillFolder(payload.diskFolderPath);
    const skill = await ctx.datastore.skills.create({ ...payload, diskFolderPath });

    ctx.events.emit('skillUpdated', skill);

    return skill;
  };
}
