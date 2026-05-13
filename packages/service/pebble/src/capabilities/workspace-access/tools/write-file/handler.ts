import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import { resolveWorkspacePath } from '../../path-safety';

const schema = z.object({
  path: z.string().describe('Workspace-relative path of the file to write.'),
  content: z.string().describe('Contents to write. Replaces the file in full.'),
});

export function buildWriteFileTool(workspacePath: string) {
  return new NativeTool({
    description: `
Writes contents to a file inside the workspace. Replaces the file in full,
or creates it if missing. Parent directories are created as needed.
    `.trim(),
    name: 'write-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(workspacePath, input.path);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, input.content);
    return ToolResponse.success([Cell.text(`Wrote ${input.path} (${input.content.length} chars).`)]);
  });
}
