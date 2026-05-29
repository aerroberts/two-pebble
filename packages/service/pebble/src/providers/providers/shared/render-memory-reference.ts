/**
 * Public shape of a resolved `memoryReference` cell's content. The provider
 * render path consumes this directly.
 */
export interface MemoryReferenceCellContent {
  memoryId: string;
  name: string;
  index?: string;
  files?: string[];
  unavailable?: boolean;
}

/**
 * Serializes a `memoryReference` cell into a plain-text navigation block for
 * provider prompts. The block injects the curated `index.md` and a file
 * tree — navigation, not the corpus. The agent reads individual files via
 * the `memory-read-file` tool keyed by `memoryId`.
 *
 * A missing folder collapses to a one-line unavailable marker; a missing
 * `index.md` becomes a one-line warning followed by the tree.
 */
export function renderMemoryReferenceText(content: MemoryReferenceCellContent): string {
  if (content.unavailable === true) {
    return `[memory ${content.name} (id: ${content.memoryId}) unavailable: folder missing]`;
  }

  const header = `{begin memory: ${content.name} (memoryId: ${content.memoryId})}`;
  const footer = '{end memory}';
  const indexBlock =
    content.index === undefined || content.index.length === 0
      ? '[no index.md — read files directly via memory-read-file]'
      : `index.md:\n${content.index}`;
  const files = content.files ?? [];
  const fileTree = files.length === 0 ? '(no files yet)' : files.map((file) => `- ${file}`).join('\n');
  const filesBlock = `Files (read via memory-read-file with this memoryId):\n${fileTree}`;

  return `${header}\n${indexBlock}\n${filesBlock}\n${footer}`;
}
