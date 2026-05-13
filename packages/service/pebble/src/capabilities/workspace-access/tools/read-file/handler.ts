import fs from 'node:fs/promises';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import { resolveWorkspacePath } from '../../path-safety';

const MAX_OUTPUT_CHARS = 3000;

const schema = z.object({
  path: z.string().describe('Workspace-relative path to read.'),
  offset: z.number().int().nonnegative().optional().describe('Byte offset to start reading from. Defaults to 0.'),
});

export function buildReadFileTool(workspacePath: string) {
  return new NativeTool({
    description: `
Reads the contents of a file inside the workspace and returns them as text. Output
is truncated at ${MAX_OUTPUT_CHARS} characters; for files larger than that, pass an
explicit \`offset\` to read a later window. The returned response always reports the
file's total size so callers can paginate.
    `.trim(),
    name: 'read-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(workspacePath, input.path);
    const contents = await fs.readFile(absolute, 'utf8');
    const offset = input.offset ?? 0;
    const window = contents.slice(offset, offset + MAX_OUTPUT_CHARS);
    const truncated = offset + window.length < contents.length;
    const header = `${input.path} — total ${contents.length} chars, showing ${window.length} starting at ${offset}${truncated ? ' (truncated)' : ''}`;
    return ToolResponse.success([Cell.text(header), Cell.codeBlock('', window)]);
  });
}
