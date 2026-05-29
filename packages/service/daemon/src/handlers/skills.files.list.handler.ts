import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { listSkillFiles } from '../skills/skill-files';
import type { DaemonHandlerContext } from '../types';

type SkillFilesListOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listSkillFiles'>;
type SkillFilesListPayload = SkillFilesListOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: SkillFilesListPayload) {
    const skill = await ctx.datastore.skills.read({ id: payload.skillId });
    try {
      const files = await listSkillFiles(skill.diskFolderPath);
      return { files };
    } catch {
      throw new Error(`skill folder missing: ${skill.diskFolderPath}`);
    }
  };
}
