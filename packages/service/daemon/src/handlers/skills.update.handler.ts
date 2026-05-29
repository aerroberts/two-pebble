import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { validateSkillFolder } from '../skills/skill-folder';
import type { DaemonHandlerContext } from '../types';

type UpdateSkillOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateSkill'>;
type UpdateSkillPayload = UpdateSkillOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateSkillPayload) {
    // Re-validate only when the path is changing; name/description edits
    // never touch disk.
    const diskFolderPath =
      payload.diskFolderPath === undefined ? undefined : validateSkillFolder(payload.diskFolderPath);
    const skill = await ctx.datastore.skills.update({
      ...payload,
      ...(diskFolderPath === undefined ? {} : { diskFolderPath }),
    });

    ctx.events.emit('skillUpdated', skill);

    return skill;
  };
}
