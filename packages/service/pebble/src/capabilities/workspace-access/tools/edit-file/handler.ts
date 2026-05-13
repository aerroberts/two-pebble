import fs from 'node:fs/promises';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import { resolveWorkspacePath } from '../../path-safety';

const schema = z.object({
  path: z.string().describe('Workspace-relative path of the file to edit.'),
  oldString: z.string().describe('Exact substring to find. Must match a single occurrence unless replaceAll is true.'),
  newString: z.string().describe('Replacement text.'),
  replaceAll: z.boolean().optional().describe('When true, replaces every occurrence. Defaults to false.'),
});

export function buildEditFileTool(workspacePath: string) {
  return new NativeTool({
    description: `
Replaces text inside an existing workspace file. By default oldString must
appear exactly once; set replaceAll to swap every occurrence. Use this for
small, targeted edits; use write-file for full rewrites and patch-file for
multi-hunk patches.
    `.trim(),
    name: 'edit-file',
    schema,
  }).onInvoke(async (input) => {
    const absolute = resolveWorkspacePath(workspacePath, input.path);
    const original = await fs.readFile(absolute, 'utf8');
    const occurrences = countOccurrences(original, input.oldString);
    if (occurrences === 0) {
      const message = `oldString not found in ${input.path}.`;
      return ToolResponse.error(message, [Cell.text(message)]);
    }
    if (occurrences > 1 && input.replaceAll !== true) {
      const message = `oldString matched ${occurrences} times in ${input.path}; set replaceAll=true or narrow the match.`;
      return ToolResponse.error(message, [Cell.text(message)]);
    }
    const next =
      input.replaceAll === true
        ? original.split(input.oldString).join(input.newString)
        : original.replace(input.oldString, input.newString);
    await fs.writeFile(absolute, next);
    return ToolResponse.success([
      Cell.text(`Edited ${input.path} (${occurrences} replacement${occurrences === 1 ? '' : 's'}).`),
    ]);
  });
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = 0;
  while (index < haystack.length) {
    const foundIndex = haystack.indexOf(needle, index);
    if (foundIndex === -1) break;
    count += 1;
    index = foundIndex + needle.length;
  }
  return count;
}
