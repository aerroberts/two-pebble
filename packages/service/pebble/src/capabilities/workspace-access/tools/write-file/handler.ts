import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { WorkspaceAccessCapability } from '../../capability';
import writeFileToolDescription from '../../prompts/write-file-tool-description.md?raw';
import { resolveWorkspacePath } from '../../utils/path-safety';

const schema = z.object({
  path: z.string().describe('Workspace-relative path of the file to write.'),
  content: z.string().describe('Contents to write. Replaces the file in full.'),
});

export function buildWriteFileTool(capability: WorkspaceAccessCapability) {
  return new NativeTool({
    description: writeFileToolDescription,
    name: 'write-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(capability.workspacePath(), input.path);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, input.content);
    return ToolResponse.success([Cell.text(`Wrote ${input.path} (${input.content.length} chars).`)]);
  });
}
