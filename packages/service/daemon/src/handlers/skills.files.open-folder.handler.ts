import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { validateSkillFolder } from '../skills/skill-folder';
import type { DaemonHandlerContext } from '../types';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type SkillFolderOpenOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openSkillFolder'>;
type SkillFolderOpenPayload = SkillFolderOpenOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: SkillFolderOpenPayload) {
    const skill = await ctx.datastore.skills.read({ id: payload.skillId });
    const path = validateSkillFolder(skill.diskFolderPath);
    Bun.spawn({ cmd: getOpenFileCommand(path), stderr: 'ignore', stdout: 'ignore' });
    return { path };
  };
}
