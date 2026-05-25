import fs from 'node:fs/promises';
import path from 'node:path';
import { applyPatch } from 'diff';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import { resolveWorkspacePath } from '../../path-safety';
import patchFileToolDescription from '../../prompts/patch-file-tool-description.md?raw';

const schema = z.object({
  path: z.string().describe('Workspace-relative path of the file to patch.'),
  patch: z.string().describe('Unified diff to apply. Standard `diff -u` format with --- / +++ headers and @@ hunks.'),
});

export function buildPatchFileTool(workspacePath: string) {
  return new NativeTool({
    description: patchFileToolDescription,
    name: 'patch-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(workspacePath, input.path);
    let original: string;
    try {
      original = await fs.readFile(absolute, 'utf8');
    } catch {
      original = '';
    }
    const result = applyPatch(original, input.patch);
    if (result === false) {
      const message = `Failed to apply patch to ${input.path}: hunk context did not match.`;
      return ToolResponse.error(message, [Cell.text(message)]);
    }
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, result);
    return ToolResponse.success([Cell.text(`Patched ${input.path} (${result.length} chars).`)]);
  });
}
