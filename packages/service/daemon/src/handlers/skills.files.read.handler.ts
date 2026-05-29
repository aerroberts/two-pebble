import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { readSkillFile } from '../skills/skill-files';
import type { DaemonHandlerContext } from '../types';

type SkillFilesReadOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readSkillFile'>;
type SkillFilesReadPayload = SkillFilesReadOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: SkillFilesReadPayload) {
    const skill = await ctx.datastore.skills.read({ id: payload.skillId });
    const content = await readSkillFile(skill.diskFolderPath, payload.file);
    return { content };
  };
}
