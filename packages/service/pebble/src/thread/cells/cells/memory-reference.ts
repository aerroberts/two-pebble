export interface MemoryReferenceCellInput {
  memoryId: string;
  name: string;
  /**
   * Contents of the collection's `index.md`. Populated by the daemon
   * resolver; omitted at composer-insertion time and when the file is
   * missing.
   */
  index?: string;
  /**
   * Shallow file listing relative to the collection folder. Populated by
   * the resolver so the agent can navigate via `memory-read-file`.
   */
  files?: string[];
  /**
   * True when the on-disk folder is missing entirely (orphaned row).
   */
  unavailable?: boolean;
}

/**
 * Public shape of a resolved `memoryReference` cell's content. The provider
 * render path consumes this directly.
 */
export type MemoryReferenceCellContent = MemoryReferenceCellInput;

/**
 * Serializes a `memoryReference` cell into a plain-text navigation block for
 * provider prompts and trace inspection. The block injects the curated
 * `index.md` and a file tree, not the full corpus.
 */
export function renderMemoryReferenceText(content: MemoryReferenceCellContent): string {
  if (content.unavailable === true) {
    return `[memory ${content.name} (id: ${content.memoryId}) unavailable: folder missing]`;
  }

  const header = `{begin memory: ${content.name} (memoryId: ${content.memoryId})}`;
  const footer = '{end memory}';
  const indexBlock =
    content.index === undefined || content.index.length === 0
      ? '[no index.md - read files directly via memory-read-file]'
      : `index.md:\n${content.index}`;
  const files = content.files ?? [];
  const fileTree = files.length === 0 ? '(no files yet)' : files.map((file) => `- ${file}`).join('\n');
  const filesBlock = `Files (read via memory-read-file with this memoryId):\n${fileTree}`;

  return `${header}\n${indexBlock}\n${filesBlock}\n${footer}`;
}

/**
 * A `/`-mention of a whole memory collection. Unlike `documentReference`,
 * the resolved cell injects navigation (index + file tree) rather than the
 * full corpus — collections can be huge. The agent reaches file contents
 * through the MemoryAccessCapability tools keyed by `memoryId`.
 */
export function memoryReference(input: MemoryReferenceCellInput) {
  return {
    type: 'memoryReference' as const,
    content: {
      memoryId: input.memoryId,
      name: input.name,
      ...(input.index === undefined ? {} : { index: input.index }),
      ...(input.files === undefined ? {} : { files: input.files }),
      ...(input.unavailable === undefined ? {} : { unavailable: input.unavailable }),
    },
  };
}
