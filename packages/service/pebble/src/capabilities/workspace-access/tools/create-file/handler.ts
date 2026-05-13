import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import { resolveWorkspacePath } from '../../path-safety';

const schema = z.object({
  path: z.string().describe('Workspace-relative path of the new file.'),
  content: z.string().describe('Contents to write.'),
});

export function buildCreateFileTool(workspacePath: string) {
  return new NativeTool({
    description: `
Creates a new file inside the workspace with the given contents. Errors if the file
already exists; use write-file or edit-file to update existing files. Parent
directories are created if they do not exist.
    `.trim(),
    name: 'create-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(workspacePath, input.path);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    try {
      await fs.writeFile(absolute, input.content, { flag: 'wx' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(message)]);
    }
    return ToolResponse.success([Cell.text(`Created ${input.path} (${input.content.length} chars).`)]);
  });
}
